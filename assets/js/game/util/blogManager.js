const blog_posts = "https://x8ki-letl-twmt.n7.xano.io/api:fcT2v9YQ/posts";

import { request } from "../../base/apiManager.js";

const blog_market = document.getElementById("blog-posts");

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
};

const create_blog_post = (post) => {
  const blog_card = document.createElement("a");
  const blog_image = document.createElement("img");
  const blog_column = document.createElement("div");
  const blog_title = document.createElement("div");
  const blog_date = document.createElement("div");

  blog_card.setAttribute("class", "blog-card");
  blog_image.setAttribute("class", "blog-image");
  blog_column.setAttribute("class", "blog-column");
  blog_title.setAttribute("class", "blog-title");
  blog_date.setAttribute("class", "blog-date");

  blog_card.setAttribute("href", post.url);
  blog_card.setAttribute("target", "_blank");

  const blog_format_date = new Date(post.created_at).toLocaleDateString(
    "en-US",
    {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }
  );

  blog_image.setAttribute("src", post.feature_image);
  blog_title.textContent = post.title;
  blog_date.textContent = blog_format_date;

  blog_column.appendChild(blog_title);
  blog_column.appendChild(blog_date);
  blog_card.appendChild(blog_image);
  blog_card.appendChild(blog_column);
  blog_market.appendChild(blog_card);
};

const post_request = await request(
  blog_posts,
  requestOptions,
  false,
  "blog posts"
);
const posts = post_request.Result.response.result.posts;

posts.sort((a, b) => {
  new Date(b.created_at) - new Date(a.created_at);
});

posts.forEach((post) => {
  if (post.visibility == "public") {
    create_blog_post(post);
  }
});
