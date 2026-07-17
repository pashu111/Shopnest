import Product from "../models/Product.js";

export async function validateInventory(products) {
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

    const availableStock = dbProduct.stock == null ? Infinity : Number(dbProduct.stock);
    if (availableStock < qty) {
      errors.push(
        `Only ${availableStock} ${dbProduct.name} available in stock`
      );
      continue;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

export async function deductInventory(products) {
  if (!Array.isArray(products) || products.length === 0) return;

  const deductions = [];
  for (const item of products) {
    const pid = item.productId;
    const qty = Number(item.quantity) || 0;
    if (pid && qty > 0) {
      deductions.push({ productId: pid, quantity: qty });
    }
  }

  for (const d of deductions) {
    await Product.findByIdAndUpdate(d.productId, { $inc: { stock: -d.quantity } });
  }
}
