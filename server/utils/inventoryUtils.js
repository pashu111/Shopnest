import Product from "../models/Product.js";

export async function validateAndDeductInventory(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return { valid: false, errors: ["No products in order"] };
  }

  const productIds = products.map((p) => p.productId).filter(Boolean);
  if (productIds.length === 0) {
    return { valid: false, errors: ["No valid product IDs in order"] };
  }

  const dbProducts = await Product.find({ _id: { $in: productIds } });
  const productMap = {};
  for (const p of dbProducts) {
    productMap[p._id.toString()] = p;
  }

  const errors = [];
  const deductions = [];

  for (const item of products) {
    const pid = item.productId;
    const qty = Number(item.quantity) || 0;

    if (qty <= 0) {
      errors.push(`Invalid quantity for "${item.name || pid}"`);
      continue;
    }

    const dbProduct = productMap[pid];
    if (!dbProduct) {
      errors.push(`Product "${item.name || pid}" not found in inventory`);
      continue;
    }

    const availableStock = Number(dbProduct.stock) || 0;
    if (availableStock < qty) {
      errors.push(
        `Insufficient stock for "${dbProduct.name}": requested ${qty}, available ${availableStock}`
      );
      continue;
    }

    deductions.push({ productId: pid, quantity: qty });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  for (const d of deductions) {
    await Product.findByIdAndUpdate(d.productId, { $inc: { stock: -d.quantity } });
  }

  return { valid: true, errors: [] };
}
