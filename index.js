const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

const ARTICLES_FILE = path.join(__dirname, 'articles.json');

// 读取文章
async function readArticles() {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 写入文章
async function writeArticles(articles) {
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

// 获取所有文章
app.get('/api/articles', async (req, res) => {
  const articles = await readArticles();
  res.json(articles);
});

// 添加新文章
app.post('/api/articles', async (req, res) => {
  const articles = await readArticles();
  const newArticle = {
    id: Date.now().toString(),
    ...req.body
  };
  articles.push(newArticle);
  await writeArticles(articles);
  res.status(201).json(newArticle);
});

// 更新文章
app.put('/api/articles/:id', async (req, res) => {
  const articles = await readArticles();
  const index = articles.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    articles[index] = { ...articles[index], ...req.body };
    await writeArticles(articles);
    res.json(articles[index]);
  } else {
    res.status(404).send('Article not found');
  }
});

// 删除文章
app.delete('/api/articles/:id', async (req, res) => {
  let articles = await readArticles();
  articles = articles.filter(a => a.id !== req.params.id);
  await writeArticles(articles);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
