const express = require("express");
require("./db/config");
const cors = require("cors");
const User = require("./db/User");
const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";

const app = express();
const Product = require("./db/Product");

app.use(express.json());
app.use(cors());
app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  // res.send(req.body);
  Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({
        result: "something went wrong, please try after sometime",
      });
    }
    res.send({ result, auth: token });
  });
});

// const connectDB = async () => {
// 	const productSchema = new mongoose.Schema({});
// 	const products = mongoose.model('products', productSchema);
// 	const data = await products.find();
// 	console.log(data);
// };
// connectDB();

// app.get('/', (req, res) => {
// 	res.send('welcome to mern stack course');
// });

app.post("/login", async (req, res) => {
  console.log(req.body);

  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({
            result: "something went wrong, please try after sometime",
          });
        }
        res.send({ user, auth: token });
      });
    } else {
      res.send({ result: "No user found" });
    }
  }

  // res.send(userLogin);
});

app.listen(5000, () => {
  console.log("server is running");
});

app.post("/add-product", async (req, res) => {
  let product = new Product(req.body);

  let result = await product.save();
  res.send(result);
});

app.get("/products", async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send({ result: "No Products found" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});

// app.delete('/products/:id', async (req, res) => {
// 	try {
// 		const result = await Product.deleteOne({ _id: req.params.id });
// 		if (result.deletedCount === 1) {
// 			res.status(200).json({ message: 'Product deleted successfully' });
// 		} else {
// 			res.status(404).json({ message: 'Product not found' });
// 		}
// 	} catch (error) {
// 		console.error('Error deleting product:', error);
// 		res.status(500).json({ message: 'Internal server error' });
// 	}
// });

// app.get('/product/:id', async (req, res) => {
// 	let result = await Product.findOne({ _id: req.params.id });
// 	if (result) {
// 		res.send(result);
// 	} else {
// 		res.send({ result: 'No record found' });
// 	}
// });

app.get("/product/:id", async (req, res) => {
  try {
    const result = await Product.findOne({ _id: req.params.id });

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: "No record found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/product/:id", async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/search/:key", async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});
