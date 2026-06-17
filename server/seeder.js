const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Product = require('./models/product')

dotenv.config()

const products = [
  {
    name: "Mt Everest Collector's Model",
    description: "World's highest peak — a stunning resin replica of Mount Everest. Highly detailed terrain with snow-capped summit. A must-have for serious collectors.",
    mountain: "Everest",
    region: "Himalayas",
    scale: "1:50000",
    height_of_mountain_m: 8849,
    material: "Resin",
    price: 2499,
    stock: 8,
    rating: 4.9,
    image: "http://localhost:5000/images/Mt Everest.jpg",
    isFeatured: true
  },
  {
    name: "Mt Kilimanjaro Desk Model",
    description: "Africa's rooftop in miniature form. A beautiful metal-cast model of Mt Kilimanjaro with intricate surface detailing and display stand.",
    mountain: "Kilimanjaro",
    region: "Africa",
    scale: "1:40000",
    height_of_mountain_m: 5895,
    material: "Metal",
    price: 1899,
    stock: 15,
    rating: 4.7,
    image: "http://localhost:5000/images/Mt Killimanjaro.avif",
    isFeatured: true
  },
  {
    name: "Mt Avatar Mystical Model",
    description: "Inspired by mystical floating peaks, this unique stone powder model brings fantasy and nature together in one breathtaking piece.",
    mountain: "Avatar",
    region: "Alps",
    scale: "1:20000",
    height_of_mountain_m: 3200,
    material: "Stone Powder",
    price: 1599,
    stock: 3,
    rating: 4.8,
    image: "http://localhost:5000/images/Mt AvATAR.jpg",
    isFeatured: true
  },
  {
    name: "Mt Embrace Twin Peaks Model",
    description: "A rare twin-peak mountain model representing unity and strength. Handcrafted wooden finish with premium quality base stand.",
    mountain: "Embrace",
    region: "Andes",
    scale: "1:35000",
    height_of_mountain_m: 4500,
    material: "Wood",
    price: 1799,
    stock: 0,
    rating: 4.5,
    image: "http://localhost:5000/images/Mt Embrace.jpg",
    isFeatured: false
  },
  {
    name: "MT Pleasant Valley Model",
    description: "A serene mountain valley model with lush green slopes and detailed landscape. Perfect for home decor and nature lovers.",
    mountain: "Pleasant",
    region: "Rockies",
    scale: "1:25000",
    height_of_mountain_m: 2800,
    material: "Resin",
    price: 1299,
    stock: 20,
    rating: 4.6,
    image: "http://localhost:5000/images/MT pleasant.avif",
    isFeatured: false
  },
  {
    name: "MT Small Pocket Model",
    description: "A compact and portable miniature mountain model. Perfect gift for travellers and hikers. Fits beautifully on any desk or shelf.",
    mountain: "Small",
    region: "Alps",
    scale: "1:10000",
    height_of_mountain_m: 1500,
    material: "Plastic",
    price: 699,
    stock: 35,
    rating: 4.3,
    image: "http://localhost:5000/images/MT Small.avif",
    isFeatured: false
  },
  {
    name: "Mt Town Heritage Model",
    description: "A mountain town landscape model capturing the beauty of alpine villages with snow-dusted peaks in the background. Collector's edition.",
    mountain: "Town",
    region: "Alps",
    scale: "1:15000",
    height_of_mountain_m: 2200,
    material: "Resin",
    price: 1999,
    stock: 5,
    rating: 4.7,
    image: "http://localhost:5000/images/Mt Town.jpg",
    isFeatured: true
  }
]

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected!')

    await Product.deleteMany()
    console.log('Old products cleared!')

    await Product.insertMany(products)
    console.log('✅ All 7 mountain models seeded successfully!')

    process.exit()
  } catch (error) {
    console.error('Seeder error:', error)
    process.exit(1)
  }
}

seedDB()