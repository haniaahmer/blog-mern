export async function ensureUniqueSlug(Model, baseSlug, currentId = null) {
let slug = baseSlug || "post";
let n = 0;
while (true) {
const exists = await Model.findOne(currentId ? { slug, _id: { $ne: currentId } } : { slug }).lean();
if (!exists) return slug;
n += 1;
slug = `${baseSlug}-${n}`;
}
}