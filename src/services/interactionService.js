const fs = require('node:fs/promises');
const path = require('node:path');

const dataDir = path.resolve(__dirname, '..', '..', 'data');
const storePath = path.join(dataDir, 'interactions.json');

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, '{}', 'utf8');
  }
}

async function readStore() {
  await ensureStore();

  const content = await fs.readFile(storePath, 'utf8');

  try {
    const parsed = JSON.parse(content || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(store) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

function normalizeInteraction(interaction) {
  return {
    likes: Number(interaction?.likes || 0),
    comments: Array.isArray(interaction?.comments) ? interaction.comments : [],
  };
}

async function getInteractionMap() {
  const store = await readStore();

  return Object.fromEntries(
    Object.entries(store).map(([imagePath, interaction]) => [
      imagePath,
      normalizeInteraction(interaction),
    ]),
  );
}

async function addLike(imagePath) {
  const store = await readStore();
  const current = normalizeInteraction(store[imagePath]);

  current.likes += 1;
  store[imagePath] = current;

  await writeStore(store);

  return current;
}

async function addComment(imagePath, author, text) {
  const store = await readStore();
  const current = normalizeInteraction(store[imagePath]);

  current.comments.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: author || 'Anonimo',
    text,
    createdAt: new Date().toISOString(),
  });

  store[imagePath] = current;

  await writeStore(store);

  return current;
}

module.exports = {
  getInteractionMap,
  addLike,
  addComment,
};
