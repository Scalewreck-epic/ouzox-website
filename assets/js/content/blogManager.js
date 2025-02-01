/**
 * @file blogManager.js
 * @description Handles displaying all Ouzox blog posts.
 * This module manages displaying all the Ouzox blog posts.
 */

import { request } from "../util/apiManager.js";
import { endpoints } from "./endpoints.js";

const blogMarket = document.getElementById("blog-posts");

const requestOptions = {
  method: "GET",
  headers: new Headers({ "Content-Type": "application/json" }),
};

const createBlogPost = (post) => {
  const blogCard = document.createElement("a");
  blogCard.className = "blog-card";
  blogCard.href = post.url;
  blogCard.target = "_blank";

  const blogImage = document.createElement("img");
  blogImage.className = "blog-image";
  blogImage.src = post.feature_image;

  const blogColumn = document.createElement("div");
  blogColumn.className = "blog-column";

  const blogTitle = document.createElement("div");
  blogTitle.className = "blog-title";
  blogTitle.textContent = post.title;

  const blogDate = document.createElement("div");
  blogDate.className = "blog-date";
  blogDate.textContent = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  blogColumn.append(blogTitle, blogDate);
  blogCard.append(blogImage, blogColumn);
  blogMarket.appendChild(blogCard);
};

const fetchBlogPosts = async () => {
  try {
    const result = await request(endpoints.blog.list, requestOptions, false);
    const posts = result.response.response.result.posts;

    posts
      .filter((post) => post.visibility === "public")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .forEach(createBlogPost);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }
};

fetchBlogPosts();
