//use Form in post for this
//created this for testing to make it easier for you to check instead of writing queries in the terminal
app.post("/addProduct", async function(req, res) {
  let product_id = req.body.product_id;
  let name = req.body.name;
  let description = req.body.description;
  let price = req.body.price;
  let stock = req.body.stock;
  let type = req.body.type;
  if (product_id && name && description && price && stock && type) {
    try {
      const query = "INSERT INTO Products (product_id, name, description, price, stock, type) VALUES (?, ?, ?, ?, ?, ?)";
      const db = await getDBConnection();
      await db.run(query, [product_id, name, description, price, stock, type]);
      await db.close();
      res.json({"message": "Product added successfully"});
    } catch (err) {
      res.status(SERVERERROR).json({"error": serverError});
    }
    //make sure you do not have any spaces in the form fields
  } else {
    let missing = [];
    if (!product_id) missing.push("product_id");
    if (!name) missing.push("name");
    if (!description) missing.push("description");
    if (!price) missing.push("price");
    if (!stock) missing.push("stock");
    if (!type) missing.push("type");
    res.status(USERERROR).type('text').send("Missing required product information");
  }
 });