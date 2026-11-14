export interface TSPStep {
  step: number;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  distanceKm: number;
  remaining: string[];
  reason: string;
}

export interface TSPResult {
  orderedStops: string[];
  totalDistanceKm: number;
  steps: TSPStep[];
  naiveDistanceKm: number;
  improvement: number; // percentage improvement
}

export function nearestNeighborTSP(
  depotId: string,
  stopIds: string[],
  distanceMatrix: Map<string, Map<string, number>>,
  nodeNameMap: Map<string, string> = new Map()
): TSPResult {
  if (stopIds.length === 0) {
    return { orderedStops: [depotId], totalDistanceKm: 0, steps: [], naiveDistanceKm: 0, improvement: 0 };
  }

  const getName = (id: string) => nodeNameMap.get(id) || id;
  
  // Calculate naive distance (visits stops in original input order)
  let naiveDistance = 0;
  let naiveCurrent = depotId;
  for (const stopId of stopIds) {
    naiveDistance += distanceMatrix.get(naiveCurrent)?.get(stopId) ?? Infinity;
    naiveCurrent = stopId;
  }
  naiveDistance += distanceMatrix.get(naiveCurrent)?.get(depotId) ?? Infinity;
  
  // Nearest Neighbor heuristic
  const unvisited = new Set<string>(stopIds);
  const orderedStops: string[] = [depotId];
  const steps: TSPStep[] = [];
  let currentId = depotId;
  let totalDistance = 0;
  let stepNum = 1;
  
  while (unvisited.size > 0) {
    let nearestId: string | null = null;
    let nearestDist = Infinity;
    
    const currentDistances = distanceMatrix.get(currentId);
    if (!currentDistances) break;
    
    for (const candidateId of unvisited) {
      const dist = currentDistances.get(candidateId) ?? Infinity;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = candidateId;
      }
    }
    
    if (nearestId === null || nearestDist === Infinity) break;
    
    unvisited.delete(nearestId);
    orderedStops.push(nearestId);
    totalDistance += nearestDist;
    
    const remaining = Array.from(unvisited);
    steps.push({
      step: stepNum++,
      from: currentId,
      fromName: getName(currentId),
      to: nearestId,
      toName: getName(nearestId),
      distanceKm: nearestDist,
      remaining,
      reason: `From ${getName(currentId)}, nearest unvisited node is ${getName(nearestId)} at ${nearestDist.toFixed(2)} km. Remaining: [${remaining.map(getName).join(', ')}]`,
    });
    
    currentId = nearestId;
  }
  
  // Return to depot
  const returnDist = distanceMatrix.get(currentId)?.get(depotId) ?? 0;
  totalDistance += returnDist;
  orderedStops.push(depotId);
  
  if (currentId !== depotId) {
    steps.push({
      step: stepNum,
      from: currentId,
      fromName: getName(currentId),
      to: depotId,
      toName: getName(depotId),
      distanceKm: returnDist,
      remaining: [],
      reason: `All stops visited. Returning to depot ${getName(depotId)} (${returnDist.toFixed(2)} km).`,
    });
  }
  
  const improvement = naiveDistance > 0
    ? ((naiveDistance - totalDistance) / naiveDistance) * 100
    : 0;
  
  return {
    orderedStops,
    totalDistanceKm: totalDistance,
    steps,
    naiveDistanceKm: naiveDistance,
    improvement: Math.max(0, improvement),
  };
}
