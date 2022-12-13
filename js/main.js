const createElemWithText = (tag = "p", content = "", className) => {
  const element = document.createElement(tag);
  element.textContent = content;

  if (className) element.classList.add(className);

  return element;
};

const createSelectOptions = (users) => {
  if (!users) return;

  const selectOptions = [];
  users.forEach((user) => {
    const option = createElemWithText("option", user.name);
    option.value = user.id;
    selectOptions.push(option);
  });

  return selectOptions;
};

const toggleCommentSection = (postId) => {
  if (!postId) return;

  const postSection = document.querySelector(
    `section[data-post-id='${postId}']`
  );

  if (!postSection) return null;

  postSection.classList.toggle("hide");

  return postSection;
};

const toggleCommentButton = (postId) => {
  if (!postId) return;

  const commentButton = document.querySelector(
    `button[data-post-id='${postId}']`
  );

  if (!commentButton) return null;

  commentButton.textContent === "Show Comments"
    ? (commentButton.textContent = "Hide Comments")
    : (commentButton.textContent = "Show Comments");

  return commentButton;
};

const deleteChildElements = (parentElement) => {
  if (!(parentElement instanceof HTMLElement)) return;

  let child = parentElement.lastChild;
  while (child != null) {
    parentElement.removeChild(child);
    child = parentElement.lastChild;
  }

  return parentElement;
};

const addButtonListeners = () => {
  const mainButton = document.querySelectorAll("main button");

  mainButton.forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        const postId = button.dataset.postId;
        return toggleComments(event, postId);
      },
      false
    );
  });

  return mainButton;
};

const removeButtonListeners = () => {
  const mainButton = document.querySelectorAll("main button");

  mainButton.forEach((button) => {
    button.removeEventListener("click", toggleComments, false);
  });

  return mainButton;
};

const createComments = (comments) => {
  if (!comments) return;

  const fragment = new DocumentFragment();
  comments.forEach((comment) => {
    const article = document.createElement("article");
    const h3 = createElemWithText("h3", comment.name);
    const body = createElemWithText("p", comment.body);
    const email = createElemWithText("p", `From: ${comment.email}`);
    article.append(h3, body, email);
    fragment.append(article);
  });

  return fragment;
};

const populateSelectMenu = (users) => {
  if (!users) return;

  const selectMenu = document.getElementById("selectMenu");
  const selectOptions = createSelectOptions(users);
  selectOptions.forEach((option) => selectMenu.append(option));

  return selectMenu;
};

const getUsers = async () => {
  try {
    const users = await fetch("https://jsonplaceholder.typicode.com/users");
    return await users.json();
  } catch (error) {
    console.error(error);
  }
};

const getUserPosts = async (userId) => {
  try {
    if (!userId) return;

    const posts = await fetch(
      `https://jsonplaceholder.typicode.com/posts/?userId=${userId}`
    );
    return await posts.json();
  } catch (error) {
    console.error(error);
  }
};

const getUser = async (userId) => {
  try {
    if (!userId) return;

    const user = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`
    );
    return await user.json();
  } catch (error) {
    console.error(error);
  }
};

const getPostComments = async (postId) => {
  try {
    if (!postId) return;

    const comments = await fetch(
      `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
    );
    return await comments.json();
  } catch (error) {
    console.error(error);
  }
};

const displayComments = async (postId) => {
  try {
    if (!postId) return;

    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments");
    section.classList.add("hide");
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.append(fragment);
    return section;
  } catch (error) {
    console.error(error);
  }
};

const createPosts = async (posts) => {
  try {
    if (!posts) return;

    const fragment = document.createDocumentFragment();
    for (const post of posts) {
      const article = document.createElement("article");
      const h2 = createElemWithText("h2", `${post.title}`);
      const body = createElemWithText("p", `${post.body}`);
      const id = createElemWithText("p", `Post ID: ${post.id}`);
      const author = await getUser(post.userId);
      const byline = createElemWithText(
        "p",
        `Author: ${author.name} with ${author.company.name}`
      );
      const phrase = createElemWithText("p", `${author.company.catchPhrase}`);
      const button = createElemWithText("button", "Show Comments");
      button.dataset.postId = post.id;
      const section = await displayComments(post.id);
      article.append(h2, body, id, byline, phrase, button, section);
      fragment.append(article);
    }
    return fragment;
  } catch (error) {
    console.error(error);
  }
};

const displayPosts = async (posts) => {
  const main = document.querySelector("main");

  let element;

  if (!posts)
    element = createElemWithText(
      "p",
      "Select an Employee to display their posts.",
      "default-text"
    );
  else element = await createPosts(posts);

  main.append(element);
  return element;
};

const toggleComments = (e, postId) => {
  if (!postId || !e) return;

  e.target.listener = true;

  comment = [toggleCommentSection(postId), toggleCommentButton(postId)];
  return comment;
};

const refreshPosts = async (posts) => {
  if (!posts) return;

  let main = document.querySelector("main");
  const fragment = document.createDocumentFragment();
  return [
    removeButtonListeners(),
    deleteChildElements(main),
    (fragment.append = await displayPosts(posts)),
    addButtonListeners(),
  ];
};

const selectMenuChangeEventHandler = async (e) => {
  if (!e) return;

  selectMenu.disabled = true;

  const userId = e?.target?.value || 1;
  const posts = await getUserPosts(userId);
  const refreshPostsArray = await refreshPosts(posts);
  selectMenu.disabled = false;

  return [userId, posts, refreshPostsArray];
};

const initPage = async () => {
  const users = await getUsers();
  const select = populateSelectMenu(users);
  return [users, select];
};

const initApp = () => {
  initPage();
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.addEventListener("change", selectMenuChangeEventHandler, false);
};

document.addEventListener("DOMContentLoaded", initApp, false);
