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
  const likedBy = Array.isArray(interaction?.likedBy)
    ? interaction.likedBy.map((entry) => String(entry))
    : [];

  return {
    likedBy,
    likes: likedBy.length,
    comments: Array.isArray(interaction?.comments) ? interaction.comments : [],
  };
}

function resetLegacyLikes(store) {
  return Object.fromEntries(
    Object.entries(store || {}).map(([imagePath, interaction]) => {
      const normalized = normalizeInteraction(interaction);

      return [
        imagePath,
        {
          ...normalized,
          likes: 0,
          likedBy: [],
        },
      ];
    }),
  );
}

let storeResetDone = false;

async function getInteractionMap() {
  const store = await readStore();

  if (!storeResetDone) {
    const resetStore = resetLegacyLikes(store);
    await writeStore(resetStore);
    storeResetDone = true;
    return resetStore;
  }

  return Object.fromEntries(
    Object.entries(store).map(([imagePath, interaction]) => [
      imagePath,
      normalizeInteraction(interaction),
    ]),
  );
}

async function toggleLike(imagePath, userId) {
  const store = await readStore();
  const current = normalizeInteraction(store[imagePath]);

  const alreadyLiked = current.likedBy.includes(userId);

  if (alreadyLiked) {
    current.likedBy = current.likedBy.filter((entry) => entry !== userId);
  } else {
    current.likedBy.push(userId);
  }

  current.likes = current.likedBy.length;
  store[imagePath] = current;

  await writeStore(store);

  return {
    ...current,
    likedByUser: !alreadyLiked,
  };
}

async function addComment(imagePath, user, text) {
  const store = await readStore();
  const current = normalizeInteraction(store[imagePath]);

  current.comments.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: user.displayName || user.username || 'Anonimo',
    authorId: user.id,
    text,
    createdAt: new Date().toISOString(),
  });

  current.likes = current.likedBy.length;

  store[imagePath] = current;

  await writeStore(store);

  return {
    ...current,
    likedByUser: current.likedBy.includes(user.id),
  };
}

module.exports = {
  getInteractionMap,
  toggleLike,
  addComment,
};
