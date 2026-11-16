import { Request, Response } from 'express';
import { prisma } from '../config/db';
import {
  buildAdjacencyList,
  computeDistanceMatrix,
  dijkstra,
  reconstructPath,
} from '../algorithms/dijkstra';
import { nearestNeighborTSP } from '../algorithms/nearestNeighbor';

export const getNodes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const nodes = await prisma.roadNode.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, nodes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEdges = async (_req: Request, res: Response): Promise<void> => {
  try {
    const edges = await prisma.roadEdge.findMany({
      include: { fromNode: true, toNode: true },
    });
    res.json({ success: true, edges });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const optimizeRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderIds } = req.body;

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, roadNodeId: { not: null } },
      include: { roadNode: true, customer: { select: { name: true, phone: true } } },
    });

    const [allNodes, allEdges] = await Promise.all([
      prisma.roadNode.findMany(),
      prisma.roadEdge.findMany(),
    ]);

    const graph = buildAdjacencyList(allNodes, allEdges);
    const nameMap = new Map(allNodes.map((n) => [n.id, n.name]));
    const depot = allNodes.find((n) => n.nodeType === 'DEPOT');
    if (!depot) {
      res.status(400).json({ success: false, message: 'No depot node found' });
      return;
    }

    const stopNodeIds = [...new Set(orders.map((o) => o.roadNodeId!).filter(Boolean))];
    const allRelevantIds = [depot.id, ...stopNodeIds];
    const matrix = computeDistanceMatrix(graph, allRelevantIds, nameMap);

    const tspResult = nearestNeighborTSP(depot.id, stopNodeIds, matrix, nameMap);

    // Compute exact paths between consecutive stops using Dijkstra
    const routeLegs: Array<{
      fromId: string;
      toId: string;
      fromName: string;
      toName: string;
      path: string[];
      pathNames: string[];
      distanceKm: number;
    }> = [];

    for (let i = 0; i < tspResult.orderedStops.length - 1; i++) {
      const fromId = tspResult.orderedStops[i];
      const toId = tspResult.orderedStops[i + 1];
      const { previous, distances } = dijkstra(graph, fromId, nameMap);
      const path = reconstructPath(previous, toId);
      routeLegs.push({
        fromId,
        toId,
        fromName: nameMap.get(fromId) || fromId,
        toName: nameMap.get(toId) || toId,
        path,
        pathNames: path.map((id) => nameMap.get(id) || id),
        distanceKm: distances.get(toId) ?? 0,
      });
    }

    // Map each stop to customer orders
    const stopDetails = tspResult.orderedStops.map((nodeId, i) => {
      const node = allNodes.find((n) => n.id === nodeId);
      const ordersAtStop = orders.filter((o) => o.roadNodeId === nodeId);
      return {
        sequence: i,
        nodeId,
        nodeName: nameMap.get(nodeId),
        node,
        orders: ordersAtStop,
        isDepot: nodeId === depot.id,
      };
    });

    res.json({
      success: true,
      tspResult,
      stopDetails,
      routeLegs,
      depot,
      nodes: allNodes,
      edges: allEdges,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderIds,
      stopNodeIds,
      totalDistanceKm,
      naiveDistanceKm,
      algorithmLog,
      courierId,
    } = req.body;

    const batchCount = await prisma.deliveryBatch.count();
    const batchNumber = `BATCH-${new Date().getFullYear()}-${String(batchCount + 1).padStart(4, '0')}`;

    const batch = await prisma.deliveryBatch.create({
      data: {
        batchNumber,
        status: courierId ? 'ASSIGNED' : 'PENDING',
        totalDistanceKm,
        algorithmLog: {
          totalDistanceKm,
          naiveDistanceKm,
          ...algorithmLog,
        },
        ...(courierId ? { courier: { connect: { id: courierId } } } : {}),
        deliveries: {
          create: orderIds.map((orderId: string) => ({
            order: { connect: { id: orderId } },
            ...(courierId ? { courier: { connect: { id: courierId } } } : {}),
            status: 'PENDING',
          })),
        },
        stops: {
          create: stopNodeIds.map((nodeId: string, i: number) => ({
            roadNode: { connect: { id: nodeId } },
            stopSequence: i,
          })),
        },
      },
      include: {
        deliveries: { include: { order: true } },
        stops: { include: { roadNode: true } },
      },
    });

    // Update order status to OUT_FOR_DELIVERY
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { orderStatus: 'OUT_FOR_DELIVERY' },
    });

    res.status(201).json({ success: true, batch });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const where = isAdmin
      ? {}
      : {
          OR: [
            { courierId: req.user!.id },
            { courierId: null },
          ],
        };

    const batches = await prisma.deliveryBatch.findMany({
      where,
      include: {
        deliveries: {
          include: {
            order: {
              include: {
                roadNode: true,
                customer: { select: { name: true, phone: true } },
              },
            },
          },
        },
        stops: {
          include: { roadNode: true },
          orderBy: { stopSequence: 'asc' },
        },
        courier: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, batches });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const batch = await prisma.deliveryBatch.findUnique({
      where: { id: req.params.id },
      include: {
        deliveries: {
          include: {
            order: {
              include: {
                roadNode: true,
                customer: { select: { name: true, phone: true } },
                items: { include: { product: true } },
              },
            },
          },
        },
        stops: {
          include: { roadNode: true },
          orderBy: { stopSequence: 'asc' },
        },
        courier: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!batch) {
      res.status(404).json({ success: false, message: 'Batch not found' });
      return;
    }

    res.json({ success: true, batch });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignCourier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courierId } = req.body;
    const batch = await prisma.deliveryBatch.update({
      where: { id: req.params.id },
      data: {
        courierId,
        status: 'ASSIGNED',
        deliveries: {
          updateMany: {
            where: {},
            data: { courierId },
          },
        },
      },
      include: { courier: true },
    });
    res.json({ success: true, batch });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCouriers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const couriers = await prisma.user.findMany({
      where: { role: 'COURIER' },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.json({ success: true, couriers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const completeStop = async (req: Request, res: Response): Promise<void> => {
  try {
    const stop = await prisma.deliveryStop.update({
      where: { id: req.params.stopId },
      data: { isCompleted: true },
    });

    // Also update associated deliveries and orders at this road node
    const deliveries = await prisma.delivery.findMany({
      where: { batchId: stop.batchId },
      include: { order: true },
    });

    for (const d of deliveries) {
      if (d.order.roadNodeId === stop.roadNodeId) {
        await prisma.delivery.update({
          where: { id: d.id },
          data: { status: 'DELIVERED' },
        });
        await prisma.order.update({
          where: { id: d.orderId },
          data: { orderStatus: 'DELIVERED', paymentStatus: 'PAID' },
        });
      }
    }

    // If all stops are completed, mark the batch as COMPLETED
    const pendingStops = await prisma.deliveryStop.count({
      where: { batchId: stop.batchId, isCompleted: false },
    });

    if (pendingStops === 0) {
      await prisma.deliveryBatch.update({
        where: { id: stop.batchId },
        data: { status: 'COMPLETED' },
      });
    }

    res.json({ success: true, stop, pendingStops });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, orderStatus } = req.body;
    const delivery = await prisma.delivery.update({
      where: { id: req.params.deliveryId },
      data: { status },
      include: { order: true },
    });

    if (orderStatus) {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { orderStatus },
      });
    }

    res.json({ success: true, delivery });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
