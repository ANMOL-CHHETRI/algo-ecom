"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed for Butwal E-Commerce...');
    // 1. ==================== USERS ====================
    const hashPassword = async (pwd) => bcryptjs_1.default.hash(pwd, 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@butwalecom.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@butwalecom.com',
            phone: '+977-9856012345',
            password: await hashPassword('Admin@123'),
            role: 'ADMIN',
            address: 'Traffic Chowk, Butwal-11, Rupandehi',
        },
    });
    const courier = await prisma.user.upsert({
        where: { email: 'courier@butwalecom.com' },
        update: {},
        create: {
            name: 'Ram Bahadur Thapa',
            email: 'courier@butwalecom.com',
            phone: '+977-9847123456',
            password: await hashPassword('Courier@123'),
            role: 'COURIER',
            address: 'Milanchowk, Butwal-10, Rupandehi',
        },
    });
    const customer = await prisma.user.upsert({
        where: { email: 'customer@gmail.com' },
        update: {},
        create: {
            name: 'Sita Sharma',
            email: 'customer@gmail.com',
            phone: '+977-9801234567',
            password: await hashPassword('Customer@123'),
            role: 'CUSTOMER',
            address: 'Devinagar, Butwal-5, Rupandehi',
        },
    });
    console.log('✅ Users seeded: Admin, Courier, Customer');
    // 2. ==================== CATEGORIES ====================
    const electronics = await prisma.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: {
            name: 'Electronics',
            slug: 'electronics',
            description: 'Smartphones, laptops, audio accessories, and home appliances.',
        },
    });
    const fashion = await prisma.category.upsert({
        where: { slug: 'fashion' },
        update: {},
        create: {
            name: 'Fashion',
            slug: 'fashion',
            description: 'Traditional Nepali wear, modern casuals, footwear, and accessories.',
        },
    });
    const grocery = await prisma.category.upsert({
        where: { slug: 'grocery' },
        update: {},
        create: {
            name: 'Grocery & Essentials',
            slug: 'grocery',
            description: 'Terai staple grains, pure cooking oils, organic teas, and daily provisions.',
        },
    });
    const home = await prisma.category.upsert({
        where: { slug: 'home-essentials' },
        update: {},
        create: {
            name: 'Home Essentials',
            slug: 'home-essentials',
            description: 'Kitchenware, pressure cookers, bedding, and home maintenance gear.',
        },
    });
    console.log('✅ Categories seeded');
    // 3. ==================== BUTWAL ROAD NODES ====================
    const nodeDefs = [
        { name: 'Traffic Chowk', nodeType: 'DEPOT', latitude: 27.7006, longitude: 83.4484 },
        { name: 'Golpark', nodeType: 'INTERSECTION', latitude: 27.7089, longitude: 83.4502 },
        { name: 'Kalikanagar', nodeType: 'INTERSECTION', latitude: 27.6978, longitude: 83.4521 },
        { name: 'Milanchowk', nodeType: 'INTERSECTION', latitude: 27.6952, longitude: 83.4467 },
        { name: 'Devinagar', nodeType: 'INTERSECTION', latitude: 27.6998, longitude: 83.4398 },
        { name: 'Deepnagar', nodeType: 'INTERSECTION', latitude: 27.7034, longitude: 83.4432 },
        { name: 'Sukkhanagar', nodeType: 'INTERSECTION', latitude: 27.7067, longitude: 83.4455 },
        { name: 'Horizon Chowk', nodeType: 'INTERSECTION', latitude: 27.7045, longitude: 83.4523 },
        { name: 'Drivertole / Manigram', nodeType: 'INTERSECTION', latitude: 27.6889, longitude: 83.4476 },
        { name: 'Belbas / Tamnagar', nodeType: 'INTERSECTION', latitude: 27.7012, longitude: 83.4356 },
    ];
    const nodeMap = {};
    for (const nd of nodeDefs) {
        const node = await prisma.roadNode.upsert({
            where: { name: nd.name },
            update: { latitude: nd.latitude, longitude: nd.longitude, nodeType: nd.nodeType },
            create: nd,
        });
        nodeMap[nd.name] = node;
    }
    console.log('✅ 10 Butwal Road Nodes seeded');
    // 4. ==================== ROAD EDGES ====================
    // Clear existing edges to prevent duplicates during re-seeding
    await prisma.roadEdge.deleteMany();
    const edgeDefs = [
        { from: 'Traffic Chowk', to: 'Golpark', km: 1.8 },
        { from: 'Traffic Chowk', to: 'Milanchowk', km: 1.2 },
        { from: 'Traffic Chowk', to: 'Deepnagar', km: 0.9 },
        { from: 'Traffic Chowk', to: 'Kalikanagar', km: 1.1 },
        { from: 'Traffic Chowk', to: 'Belbas / Tamnagar', km: 2.4 },
        { from: 'Golpark', to: 'Sukkhanagar', km: 0.7 },
        { from: 'Golpark', to: 'Horizon Chowk', km: 1.0 },
        { from: 'Deepnagar', to: 'Sukkhanagar', km: 0.6 },
        { from: 'Deepnagar', to: 'Devinagar', km: 1.3 },
        { from: 'Milanchowk', to: 'Kalikanagar', km: 0.8 },
        { from: 'Milanchowk', to: 'Devinagar', km: 1.5 },
        { from: 'Milanchowk', to: 'Drivertole / Manigram', km: 1.9 },
        { from: 'Kalikanagar', to: 'Drivertole / Manigram', km: 2.1 },
        { from: 'Horizon Chowk', to: 'Sukkhanagar', km: 0.5 },
        { from: 'Devinagar', to: 'Belbas / Tamnagar', km: 2.0 },
        { from: 'Sukkhanagar', to: 'Traffic Chowk', km: 1.5 },
    ];
    for (const edge of edgeDefs) {
        await prisma.roadEdge.create({
            data: {
                fromNodeId: nodeMap[edge.from].id,
                toNodeId: nodeMap[edge.to].id,
                distanceKm: edge.km,
                bidirectional: true,
            },
        });
    }
    console.log('✅ 16 Butwal Road Edges seeded');
    // 5. ==================== 36 PRODUCTS ====================
    const productsData = [
        // --- ELECTRONICS (9 products) ---
        {
            name: 'Samsung Galaxy A54 5G',
            slug: 'samsung-galaxy-a54-5g',
            sku: 'ELEC-SAM-A54-001',
            description: 'Samsung Galaxy A54 5G featuring 6.4-inch Super AMOLED 120Hz display, 50MP OIS camera, and 5000mAh battery.',
            price: 52000,
            discountPrice: 48500,
            stockQuantity: 25,
            brand: 'Samsung',
            images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'smartphone', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'samsung', weight: 1.0 },
                { featureKey: 'ram', featureValue: '8gb', weight: 0.8 },
                { featureKey: 'storage', featureValue: '256gb', weight: 0.8 },
                { featureKey: 'network', featureValue: '5g', weight: 0.9 },
                { featureKey: 'screen', featureValue: '6.4inch', weight: 0.6 },
            ],
        },
        {
            name: 'Redmi Note 12 Pro',
            slug: 'redmi-note-12-pro',
            sku: 'ELEC-XMI-RN12-002',
            description: 'Redmi Note 12 Pro with 200MP Ultra-Clear camera, 67W Turbo charging, and Dolby Vision display.',
            price: 34999,
            discountPrice: 29999,
            stockQuantity: 40,
            brand: 'Xiaomi',
            images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'smartphone', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'xiaomi', weight: 1.0 },
                { featureKey: 'ram', featureValue: '8gb', weight: 0.8 },
                { featureKey: 'storage', featureValue: '128gb', weight: 0.8 },
                { featureKey: 'network', featureValue: '5g', weight: 0.9 },
                { featureKey: 'camera', featureValue: '200mp', weight: 0.9 },
            ],
        },
        {
            name: 'JBL Flip 6 Bluetooth Speaker',
            slug: 'jbl-flip-6-bluetooth-speaker',
            sku: 'ELEC-JBL-FL6-003',
            description: 'Portable IP67 waterproof Bluetooth speaker with 2-way speaker system and 12 hours playtime.',
            price: 12500,
            discountPrice: 10500,
            stockQuantity: 18,
            brand: 'JBL',
            images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'speaker', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'jbl', weight: 1.0 },
                { featureKey: 'connectivity', featureValue: 'bluetooth', weight: 0.9 },
                { featureKey: 'waterproof', featureValue: 'ip67', weight: 0.8 },
                { featureKey: 'battery', featureValue: '12h', weight: 0.7 },
            ],
        },
        {
            name: 'Lenovo IdeaPad Slim 3 Laptop',
            slug: 'lenovo-ideapad-slim-3-laptop',
            sku: 'ELEC-LEN-IPS3-004',
            description: 'Intel Core i5 11th Gen laptop with 8GB DDR4 RAM, 512GB NVMe SSD, and 15.6" FHD display.',
            price: 85000,
            discountPrice: 79000,
            stockQuantity: 10,
            brand: 'Lenovo',
            images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'laptop', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'lenovo', weight: 1.0 },
                { featureKey: 'processor', featureValue: 'intel_core_i5', weight: 0.9 },
                { featureKey: 'ram', featureValue: '8gb', weight: 0.9 },
                { featureKey: 'storage', featureValue: '512gb_ssd', weight: 0.8 },
            ],
        },
        {
            name: 'HP Pavilion 15 Gaming Laptop',
            slug: 'hp-pavilion-15-gaming-laptop',
            sku: 'ELEC-HP-PAV15-005',
            description: 'AMD Ryzen 5 5600H, GTX 1650 4GB GPU, 16GB RAM, 512GB SSD, 144Hz high refresh rate screen.',
            price: 98000,
            discountPrice: 91500,
            stockQuantity: 6,
            brand: 'HP',
            images: ['https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'laptop', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'hp', weight: 1.0 },
                { featureKey: 'processor', featureValue: 'amd_ryzen_5', weight: 0.9 },
                { featureKey: 'ram', featureValue: '16gb', weight: 0.9 },
                { featureKey: 'gpu', featureValue: 'gtx_1650', weight: 0.9 },
            ],
        },
        {
            name: 'boAt Airdopes 141 TWS Earbuds',
            slug: 'boat-airdopes-141-tws',
            sku: 'ELEC-BOA-AD141-006',
            description: 'True wireless earbuds with 42 hours total playback, ENx noise cancellation, and ASAP fast charging.',
            price: 2499,
            discountPrice: 1999,
            stockQuantity: 55,
            brand: 'boAt',
            images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'earbuds', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'boat', weight: 1.0 },
                { featureKey: 'connectivity', featureValue: 'bluetooth', weight: 0.9 },
                { featureKey: 'battery', featureValue: '42h', weight: 0.7 },
            ],
        },
        {
            name: 'Samsung 32" Smart LED TV',
            slug: 'samsung-32-smart-led-tv',
            sku: 'ELEC-SAM-TV32-007',
            description: '32-inch High Definition Smart LED TV with built-in Wi-Fi, YouTube, Netflix, and screen mirroring.',
            price: 36000,
            discountPrice: 32500,
            stockQuantity: 12,
            brand: 'Samsung',
            images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'television', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'samsung', weight: 1.0 },
                { featureKey: 'size', featureValue: '32inch', weight: 0.8 },
                { featureKey: 'smart', featureValue: 'smart_tv', weight: 0.9 },
            ],
        },
        {
            name: 'Anker PowerCore 20000mAh Power Bank',
            slug: 'anker-powercore-20000mah',
            sku: 'ELEC-ANK-PB20-008',
            description: 'High capacity 20,000mAh dual-port power bank with PowerIQ high-speed charging technology.',
            price: 4500,
            discountPrice: 3999,
            stockQuantity: 30,
            brand: 'Anker',
            images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'power_bank', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'anker', weight: 1.0 },
                { featureKey: 'capacity', featureValue: '20000mah', weight: 0.9 },
            ],
        },
        {
            name: 'Apple iPhone 14 128GB',
            slug: 'apple-iphone-14-128gb',
            sku: 'ELEC-APL-IP14-009',
            description: 'Super Retina XDR display, advanced dual-camera system, Photonic Engine, and A15 Bionic chip.',
            price: 145000,
            discountPrice: 138000,
            stockQuantity: 4,
            brand: 'Apple',
            images: ['https://images.unsplash.com/photo-1668065999961-ed3c6e1cdf39?w=600&auto=format&fit=crop'],
            categoryId: electronics.id,
            features: [
                { featureKey: 'type', featureValue: 'smartphone', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'apple', weight: 1.0 },
                { featureKey: 'storage', featureValue: '128gb', weight: 0.8 },
                { featureKey: 'network', featureValue: '5g', weight: 0.9 },
                { featureKey: 'os', featureValue: 'ios', weight: 0.9 },
            ],
        },
        // --- FASHION (9 products) ---
        {
            name: "Traditional Men's Daura Suruwal Set",
            slug: 'traditional-mens-daura-suruwal-set',
            sku: 'FASH-DSS-M-001',
            description: 'Classic Nepalese national dress handcrafted in Palpali Dhaka / fine cotton blend. Perfect for Dashain & ceremonies.',
            price: 3500,
            discountPrice: 2999,
            stockQuantity: 20,
            brand: 'Kamana Fabrics',
            images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b0e3b?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'traditional_wear', weight: 1.0 },
                { featureKey: 'gender', featureValue: 'mens', weight: 0.9 },
                { featureKey: 'material', featureValue: 'cotton', weight: 0.8 },
                { featureKey: 'occasion', featureValue: 'festival', weight: 0.8 },
            ],
        },
        {
            name: 'Banarasi Art Silk Saree',
            slug: 'banarasi-art-silk-saree',
            sku: 'FASH-SAR-BAN-002',
            description: 'Exquisite red Banarasi art silk saree with intricate golden zari work, matching unstitched blouse piece.',
            price: 8500,
            discountPrice: 7200,
            stockQuantity: 15,
            brand: 'Varanasi Silks',
            images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'saree', weight: 1.0 },
                { featureKey: 'gender', featureValue: 'womens', weight: 0.9 },
                { featureKey: 'material', featureValue: 'silk', weight: 0.9 },
                { featureKey: 'occasion', featureValue: 'wedding', weight: 0.8 },
            ],
        },
        {
            name: "Men's Cotton Kurta Pajama Set",
            slug: 'mens-cotton-kurta-pajama-set',
            sku: 'FASH-KPS-M-003',
            description: 'Breathable pure cotton mandarin collar kurta with churidar pajama. Ideal for summer puja and family gatherings.',
            price: 1800,
            discountPrice: 1500,
            stockQuantity: 35,
            brand: 'Manyavar',
            images: ['https://images.unsplash.com/photo-1594938374182-a56e94c0c0d7?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'kurta', weight: 1.0 },
                { featureKey: 'gender', featureValue: 'mens', weight: 0.9 },
                { featureKey: 'material', featureValue: 'cotton', weight: 0.8 },
            ],
        },
        {
            name: 'Nike Air Max 270 Sneakers',
            slug: 'nike-air-max-270-sneakers',
            sku: 'FASH-NIK-AM270-004',
            description: 'Nike Air Max 270 lifestyle shoes with large heel Air unit, flexible knit upper, and all-day cushioning.',
            price: 14500,
            discountPrice: 12000,
            stockQuantity: 20,
            brand: 'Nike',
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'sneakers', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'nike', weight: 1.0 },
                { featureKey: 'activity', featureValue: 'running', weight: 0.8 },
            ],
        },
        {
            name: 'Unisex Puffer Winter Jacket',
            slug: 'unisex-puffer-winter-jacket',
            sku: 'FASH-WJP-UNI-005',
            description: 'Quilted windproof and water-resistant winter puffer coat with detachable hood for chilly Butwal mornings.',
            price: 3200,
            discountPrice: 2500,
            stockQuantity: 28,
            brand: 'Wildcraft',
            images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'jacket', weight: 1.0 },
                { featureKey: 'season', featureValue: 'winter', weight: 0.9 },
                { featureKey: 'waterproof', featureValue: 'water_resistant', weight: 0.7 },
            ],
        },
        {
            name: "Men's Crewneck T-Shirt (Pack of 3)",
            slug: 'mens-crewneck-tshirt-pack-3',
            sku: 'FASH-TSH-M-006',
            description: '100% combed cotton basic t-shirts in Black, Navy, and Heather Grey. Pre-shrunk and durable.',
            price: 1299,
            discountPrice: 999,
            stockQuantity: 60,
            brand: 'Campus Sutra',
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'tshirt', weight: 1.0 },
                { featureKey: 'gender', featureValue: 'mens', weight: 0.8 },
                { featureKey: 'material', featureValue: 'cotton', weight: 0.9 },
            ],
        },
        {
            name: 'Adidas Classic Backpack 25L',
            slug: 'adidas-classic-backpack-25l',
            sku: 'FASH-ADI-BP-007',
            description: '25-liter lightweight backpack with padded laptop sleeve, water bottle holders, and ergonomic straps.',
            price: 4200,
            discountPrice: 3500,
            stockQuantity: 22,
            brand: 'Adidas',
            images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'backpack', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'adidas', weight: 1.0 },
                { featureKey: 'capacity', featureValue: '25l', weight: 0.7 },
            ],
        },
        {
            name: "Women's Embroidered Kurti with Pant",
            slug: 'womens-embroidered-kurti-pant',
            sku: 'FASH-KUR-W-008',
            description: 'Rayon embroidered A-line straight kurti with straight trousers and chiffon dupatta.',
            price: 2400,
            discountPrice: 1950,
            stockQuantity: 25,
            brand: 'Biba',
            images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'kurti', weight: 1.0 },
                { featureKey: 'gender', featureValue: 'womens', weight: 0.9 },
                { featureKey: 'material', featureValue: 'rayon', weight: 0.8 },
            ],
        },
        {
            name: 'Goldstar Classic Running Shoes',
            slug: 'goldstar-classic-running-shoes',
            sku: 'FASH-GLD-RS-009',
            description: 'Proudly made in Nepal. High durability Goldstar mesh sports shoes for daily jogging and walking.',
            price: 1650,
            discountPrice: 1450,
            stockQuantity: 45,
            brand: 'Goldstar',
            images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop'],
            categoryId: fashion.id,
            features: [
                { featureKey: 'type', featureValue: 'sneakers', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'goldstar', weight: 1.0 },
                { featureKey: 'origin', featureValue: 'nepal', weight: 1.0 },
            ],
        },
        // --- GROCERY (9 products) ---
        {
            name: 'Premium Basmati Rice 5kg',
            slug: 'premium-basmati-rice-5kg',
            sku: 'GROC-BRS-5KG-001',
            description: 'Aged long-grain Terai Basmati rice with exquisite aroma and fluffy non-sticky texture.',
            price: 650,
            discountPrice: 599,
            stockQuantity: 100,
            brand: 'Annapurna',
            images: ['https://images.unsplash.com/photo-1536304993881-ff86e4f606a4?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'rice', weight: 1.0 },
                { featureKey: 'variety', featureValue: 'basmati', weight: 0.9 },
                { featureKey: 'weight', featureValue: '5kg', weight: 0.8 },
            ],
        },
        {
            name: 'Pure Mustard Oil 1 Litre (Sarso Tel)',
            slug: 'pure-mustard-oil-1-litre',
            sku: 'GROC-MO-1L-002',
            description: 'Cold-pressed authentic mustard oil. Unadulterated pungent aroma for traditional Nepali dal-bhat-tarkari.',
            price: 250,
            stockQuantity: 150,
            brand: 'Patanjali',
            images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'cooking_oil', weight: 1.0 },
                { featureKey: 'variety', featureValue: 'mustard', weight: 0.9 },
                { featureKey: 'volume', featureValue: '1litre', weight: 0.8 },
            ],
        },
        {
            name: 'Red Masoor Dal 2kg',
            slug: 'red-masoor-dal-2kg',
            sku: 'GROC-DAL-2KG-003',
            description: 'Unpolished protein-rich split red lentils. Quick cooking and staple nourishment for every household.',
            price: 380,
            stockQuantity: 80,
            brand: 'Local Terai',
            images: ['https://images.unsplash.com/photo-1515543904379-3d757abe9eb4?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'lentils', weight: 1.0 },
                { featureKey: 'variety', featureValue: 'masoor', weight: 0.9 },
            ],
        },
        {
            name: 'Wai Wai Instant Noodles (Box of 30)',
            slug: 'wai-wai-instant-noodles-box-30',
            sku: 'GROC-WW-30P-004',
            description: "Nepal's iconic ready-to-eat spiced chicken noodle snack. Value pack of 30 packs with taste maker and onion oil.",
            price: 750,
            discountPrice: 650,
            stockQuantity: 65,
            brand: 'Wai Wai',
            images: ['https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'instant_noodles', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'wai_wai', weight: 1.0 },
                { featureKey: 'pack', featureValue: '30_box', weight: 0.7 },
            ],
        },
        {
            name: 'Ilam Orthodox Organic Black Tea 500g',
            slug: 'ilam-orthodox-organic-black-tea-500g',
            sku: 'GROC-ILM-500G-005',
            description: 'Hand-picked whole-leaf orthodox tea grown in the high altitudes of Ilam, Eastern Nepal. Rich in antioxidants.',
            price: 450,
            stockQuantity: 70,
            brand: 'Himalayan Tea',
            images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'tea', weight: 1.0 },
                { featureKey: 'origin', featureValue: 'ilam_nepal', weight: 0.9 },
            ],
        },
        {
            name: 'Refined White Sugar 2kg',
            slug: 'refined-white-sugar-2kg',
            sku: 'GROC-SUG-2KG-006',
            description: 'Crystalline sulphurless white refined sugar for daily tea, sweets, and kitchen baking needs.',
            price: 180,
            stockQuantity: 200,
            brand: 'Lumbini Sugar Mills',
            images: ['https://images.unsplash.com/photo-1626259424685-2c2f39ef6983?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'sugar', weight: 1.0 },
                { featureKey: 'weight', featureValue: '2kg', weight: 0.8 },
            ],
        },
        {
            name: 'Britannia Good Day Cashew Cookies (10 Packs)',
            slug: 'britannia-good-day-cashew-cookies',
            sku: 'GROC-BGB-10P-007',
            description: 'Rich buttery cookies studded with roasted crunchy cashew nuts. Pack of 10 individual family packs.',
            price: 280,
            discountPrice: 250,
            stockQuantity: 90,
            brand: 'Britannia',
            images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'biscuits', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'britannia', weight: 1.0 },
            ],
        },
        {
            name: 'Lumbini Pure Cow Ghee 500ml',
            slug: 'lumbini-pure-cow-ghee-500ml',
            sku: 'GROC-GHE-500ML-008',
            description: 'Traditional Bilona-churned pure cow milk ghee from Rupandehi local dairy farms. Rich golden aroma.',
            price: 950,
            stockQuantity: 40,
            brand: 'Lumbini Dairy',
            images: ['https://images.unsplash.com/photo-1627482581839-1e96a79f4b96?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'ghee', weight: 1.0 },
                { featureKey: 'purity', featureValue: 'pure_cow', weight: 0.9 },
            ],
        },
        {
            name: 'Century Garam Masala 100g',
            slug: 'century-garam-masala-100g',
            sku: 'GROC-CEN-GM-009',
            description: 'Aromatic blend of roasted ground spices: cardamom, cinnamon, cloves, and mace for curry and momo filling.',
            price: 140,
            stockQuantity: 120,
            brand: 'Century Spices',
            images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop'],
            categoryId: grocery.id,
            features: [
                { featureKey: 'type', featureValue: 'spices', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'century', weight: 1.0 },
            ],
        },
        // --- HOME ESSENTIALS (9 products) ---
        {
            name: 'Prestige Deluxe Aluminium Pressure Cooker 5L',
            slug: 'prestige-deluxe-pressure-cooker-5l',
            sku: 'HOME-PPC-5L-001',
            description: '5-litre hard anodized aluminium pressure cooker with pressure indicator and safety release valve.',
            price: 2800,
            discountPrice: 2400,
            stockQuantity: 20,
            brand: 'Prestige',
            images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'pressure_cooker', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'prestige', weight: 1.0 },
                { featureKey: 'capacity', featureValue: '5litre', weight: 0.8 },
            ],
        },
        {
            name: 'Stainless Steel 3-Tier Lunch Box (Tiffin)',
            slug: 'stainless-steel-3-tier-lunch-box',
            sku: 'HOME-SST-3T-002',
            description: 'Food-grade stainless steel leakproof stackable lunch box container with sturdy side locking latch.',
            price: 650,
            discountPrice: 550,
            stockQuantity: 45,
            brand: 'Milton',
            images: ['https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'tiffin_box', weight: 1.0 },
                { featureKey: 'material', featureValue: 'stainless_steel', weight: 0.9 },
            ],
        },
        {
            name: 'Bajaj Ultima High-Speed Table Fan 400mm',
            slug: 'bajaj-ultima-high-speed-table-fan-400mm',
            sku: 'HOME-BTF-400-003',
            description: 'Aerodynamically designed 3-speed table fan with 90-degree oscillation to beat the scorching Terai summer.',
            price: 2200,
            discountPrice: 1900,
            stockQuantity: 15,
            brand: 'Bajaj',
            images: ['https://images.unsplash.com/photo-1626853547803-8e6c05e63296?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'fan', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'bajaj', weight: 1.0 },
            ],
        },
        {
            name: 'Philips Cool Daylight LED Bulb 9W (Pack of 4)',
            slug: 'philips-cool-daylight-led-bulb-9w-pack-4',
            sku: 'HOME-LED-9W-P4-004',
            description: 'Energy-saving 9W LED B22 bulbs delivering 825 lumens of bright white light with 15,000 hours lifespan.',
            price: 480,
            discountPrice: 400,
            stockQuantity: 80,
            brand: 'Philips',
            images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'led_bulb', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'philips', weight: 1.0 },
                { featureKey: 'wattage', featureValue: '9w', weight: 0.8 },
            ],
        },
        {
            name: 'Cotton King Size Bedsheet with 2 Pillow Covers',
            slug: 'cotton-king-size-bedsheet-pillow-covers',
            sku: 'HOME-CBS-KNG-005',
            description: '100% pure cotton 240 TC glazed bedsheet in royal floral prints for king size double bed (108 x 108 inches).',
            price: 1200,
            discountPrice: 950,
            stockQuantity: 25,
            brand: 'Swayam',
            images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'bedsheet', weight: 1.0 },
                { featureKey: 'material', featureValue: 'cotton', weight: 0.9 },
            ],
        },
        {
            name: 'Microfibre Sleeping Pillows (Pack of 2)',
            slug: 'microfibre-sleeping-pillows-pack-2',
            sku: 'HOME-MFP-P2-006',
            description: 'Hypoallergenic virgin microfibre plush sleeping pillows with breathable cotton casing.',
            price: 850,
            discountPrice: 699,
            stockQuantity: 30,
            brand: 'Story@Home',
            images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'pillow', weight: 1.0 },
                { featureKey: 'material', featureValue: 'microfibre', weight: 0.9 },
            ],
        },
        {
            name: 'Gala Plastic Broom with Long Dustpan Set',
            slug: 'gala-plastic-broom-dustpan-set',
            sku: 'HOME-BRD-SET-007',
            description: 'Dust-free washable synthetic bristles broom with clip-on rubber-lip dustpan for clean floor sweeping.',
            price: 350,
            stockQuantity: 50,
            brand: 'Gala',
            images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'broom', weight: 1.0 },
                { featureKey: 'brand', featureValue: 'gala', weight: 1.0 },
            ],
        },
        {
            name: 'Vinod Granite Non-Stick Frying Pan 24cm',
            slug: 'vinod-granite-non-stick-frying-pan-24cm',
            sku: 'HOME-NSP-24-008',
            description: 'Heavy gauge 5-layer granite coating induction & gas stove compatible frying pan for rotis and momos.',
            price: 1500,
            discountPrice: 1200,
            stockQuantity: 20,
            brand: 'Vinod',
            images: ['https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'fry_pan', weight: 1.0 },
                { featureKey: 'material', featureValue: 'granite_non_stick', weight: 0.9 },
            ],
        },
        {
            name: 'Cello Aqua Steel Vacuum Insulated Flask 1000ml',
            slug: 'cello-aqua-steel-vacuum-flask-1000ml',
            sku: 'HOME-CEL-FLK-009',
            description: 'Double wall stainless steel thermos flask keeping beverages hot or cold for 24 hours.',
            price: 1100,
            discountPrice: 920,
            stockQuantity: 28,
            brand: 'Cello',
            images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop'],
            categoryId: home.id,
            features: [
                { featureKey: 'type', featureValue: 'flask', weight: 1.0 },
                { featureKey: 'material', featureValue: 'stainless_steel', weight: 0.9 },
            ],
        },
    ];
    const seededProducts = {};
    for (const p of productsData) {
        const { features, ...productInfo } = p;
        const prod = await prisma.product.upsert({
            where: { sku: p.sku },
            update: productInfo,
            create: {
                ...productInfo,
                features: { create: features },
            },
        });
        seededProducts[p.sku] = prod;
    }
    console.log(`✅ ${productsData.length} Products seeded across 4 categories`);
    // 6. ==================== SAMPLE ORDERS ====================
    // Check if sample orders exist
    const existingOrdersCount = await prisma.order.count();
    if (existingOrdersCount === 0) {
        const sampleStops = [
            nodeMap['Golpark'],
            nodeMap['Milanchowk'],
            nodeMap['Devinagar'],
            nodeMap['Kalikanagar'],
            nodeMap['Sukkhanagar'],
        ];
        const prodValues = Object.values(seededProducts);
        for (let i = 0; i < 5; i++) {
            const stop = sampleStops[i];
            const p1 = prodValues[i * 2];
            const p2 = prodValues[i * 2 + 1];
            const price1 = p1.discountPrice ?? p1.price;
            const price2 = p2 ? (p2.discountPrice ?? p2.price) : 0;
            const totalAmount = price1 + price2;
            await prisma.order.create({
                data: {
                    orderNumber: `BW-2024-DEMO0${i + 1}`,
                    customerId: customer.id,
                    totalAmount,
                    deliveryCharge: 50,
                    paymentMethod: i === 0 ? 'ESEWA' : i === 1 ? 'KHALTI' : 'COD',
                    paymentStatus: i < 2 ? 'PAID' : 'PENDING',
                    orderStatus: i === 0 ? 'PROCESSING' : i === 1 ? 'PROCESSING' : 'PLACED',
                    deliveryAddress: `${stop.name}, Ward No. ${i + 1}, Butwal Sub-Metropolitan, Rupandehi`,
                    deliveryPhone: '+977-9801234567',
                    roadNodeId: stop.id,
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    items: {
                        create: [
                            { productId: p1.id, quantity: 1, unitPrice: price1 },
                            ...(p2 ? [{ productId: p2.id, quantity: 1, unitPrice: price2 }] : []),
                        ],
                    },
                },
            });
        }
        console.log('✅ 5 Initial localized delivery orders seeded');
    }
    console.log('\n🎉 Butwal E-Commerce Database Seeding Complete!');
    console.log('----------------------------------------------------');
    console.log('Credentials:');
    console.log('👤 Admin:    admin@butwalecom.com    / Admin@123');
    console.log('🚚 Courier:  courier@butwalecom.com  / Courier@123');
    console.log('🛍️ Customer: customer@gmail.com      / Customer@123');
    console.log('----------------------------------------------------');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
