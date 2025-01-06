// Handles showing blog posts from Ghost. Blog is currently inactive so API doesn't work.

import { request } from "../base/apiManager.js";
import { endpoints } from "./endpoints.js";

const blog_market = document.getElementById("blog-posts");

const requestOptions = {
  method: "GET",
  headers: new Headers({ "Content-Type": "application/json" }),
};

const create_blog_post = (post) => {
  const blog_card = document.createElement("a");
  blog_card.className = "blog-card";
  blog_card.href = post.url;
  blog_card.target = "_blank";

  const blog_image = document.createElement("img");
  blog_image.className = "blog-image";
  blog_image.src = post.feature_image;

  const blog_column = document.createElement("div");
  blog_column.className = "blog-column";

  const blog_title = document.createElement("div");
  blog_title.className = "blog-title";
  blog_title.textContent = post.title;

  const blog_date = document.createElement("div");
  blog_date.className = "blog-date";
  blog_date.textContent = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "2-digit", month: "2-digit", day: "2-digit"
  });

  blog_column.append(blog_title, blog_date);
  blog_card.append(blog_image, blog_column);
  blog_market.appendChild(blog_card);
};

const result = await request(endpoints.blog.list, requestOptions, false);
const posts = result.response.response.result.posts;

posts
  .filter(post => post.visibility === "public")
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .forEach(create_blog_post);