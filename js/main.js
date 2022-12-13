function createElemWithText(htmlElement = "p", textContent = "", className) {
  const Element = document.createElement(htmlElement);
  Element.textContent = textContent;
  if (className) {
    Element.classList.add(className);
  }
  return Element;
}
const createSelectOptions = (userJSON) => {
  if (!userJSON) return;
  const elements = [];
  userJSON.forEach((user) => {
    const Element = document.createElement("option");
    Element.value = user.id;
    Element.textContent = user.name;
    elements.push(Element);
  });
  return elements;
};
const toggleCommentSection = (postId) => {
  if (!postId) return;
  const postSelection = document.querySelector(
    `section[data-post-id='${postId}']`
  );
  if (postSelection === null) return null;
  postSelection.classList.toggle("hide");
  return postSelection;
};

const toggleCommentButton = (postId) => {
  if (!postId) return;
  const buttonSelection = document.querySelector(
    `button[data-post-id='${postId}']`
  );
  if (buttonSelection == null) return null;
  if (buttonSelection.textContent == "Show Comments") {
    buttonSelection.textContent = "Hide Comments";
  } else {
    buttonSelection.textContent = "Show Comments";
  }
  return buttonSelection;
};

const deleteChildElements = (ElementParent) => {
  if (!ElementParent?.tagName) return;
  let childElement = ElementParent.lastElementChild;
  while (childElement) {
    ElementParent.removeChild(childElement);
    childElement = ElementParent.lastElementChild;
  }
  return ElementParent;
};

const addButtonListeners = () => {
  const mainButton = document.querySelectorAll("main button");
  if (mainButton) {
    mainButton.forEach((button) => {
      const postId = button.dataset.postId;
      button.addEventListener("click", (event) => {
        toggleComments(event, postId);
      });
      return button;
    });
    return mainButton;
  }
};

const removeButtonListeners = () => {
  const mainButton = document.querySelectorAll("main button");
  if (mainButton) {
    mainButton.forEach((button) => {
      const postId = button.dataset.postId;
      button.removeEventListener("click", (event) => {
        toggleComments(event, postId);
      });
      return button;
    });
    return mainButton;
  }
};

const createComments = (JSONcomments) => {
  if (!JSONcomments) return;
  const fragment = document.createDocumentFragment();
  JSONcomments.forEach((comment) => {
    const article = document.createElement("article");
    const name = createElemWithText("h3", comment.name);
    const body = createElemWithText("p", comment.body);
    const credit = createElemWithText("p", `From: ${comment.email}`);
    article.append(name, body, credit);
    fragment.append(article);
  });
  return fragment;
};

const populateSelectMenu = (JSONusers) => {
  if (!JSONusers) return;
  const menu = document.getElementById("selectMenu");
  const userOptions = createSelectOptions(JSONusers);
  userOptions.forEach((option) => {
    menu.append(option);
  });
  return menu;
};

const getUsers = async () => {
  try {
    const JSONtext = await (
      await fetch("https://jsonplaceholder.typicode.com/users")
    ).json();
    return JSONtext;
  } catch (err) {
    console.error(err.stack);
  }
};

const getUserPosts = async (userId) => {
  if (!userId) return;
  try {
    const JSONtext = await (
      await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
    ).json();
    return JSONtext;
  } catch (err) {
    console.error(err.stack);
  }
};

const getUser = async (userId) => {
  if (!userId) return;
  try {
    const JSONtext = await (
      await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
    ).json();
    return JSONtext;
  } catch (err) {
    console.error(err.stack);
  }
};

const getPostComments = async (postId) => {
  if (!postId) return;
  try {
    const JSONtext = await (
      await fetch(
        `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
      )
    ).json();
    return JSONtext;
  } catch (err) {
    console.error(err.stack);
  }
};

const displayComments = async (postId) => {
  if (!postId) return;
  const section = document.createElement("section");
  section.dataset.postId = postId;
  // section.setAttribute("postId", `${section.dataset.postId}`);
  section.classList.add("comments", "hide");
  const comments = await getPostComments(postId);
  const fragment = createComments(comments);
  section.append(fragment);
  return section;
};

const createPosts = async (postJSON) => {
  if (!postJSON) return;
  const fragment = document.createDocumentFragment();
  for (const post of postJSON) {
    const title = createElemWithText("h2", post.title);
    const article = document.createElement("article");
    const id = createElemWithText("p", `Post ID: ${post.id}`);
    const body = createElemWithText("p", post.body);
    const author = await getUser(post.userId);
    const catchphrase = createElemWithText("p", author.company.catchPhrase);
    const credit = createElemWithText(
      "p",
      `Author: ${author.name} with ${author.company.name}`
    );
    const commentButton = createElemWithText("button", "Show Comments");
    commentButton.dataset.postId = post.id;
    const section = await displayComments(post.id);
    article.append(
      title,
      body,
      id,
      credit,
      catchphrase,
      commentButton,
      section
    );
    fragment.append(article);
  }
  return fragment;
};

const displayPosts = async (posts) => {
  const main = document.querySelector("main");
  if (posts) {
    const element = await createPosts(posts);
    main.append(element);
    return element;
  } else {
    const element = createElemWithText(
      "p",
      "Select an Employee to display their posts.",
      "default-text"
    );
    main.append(element);
    return element;
  }
};

const toggleComments = (event, postId) => {
  if (!event || !postId) return;
  event.target.listener = true;
  const section = toggleCommentSection(postId);
  const button = toggleCommentButton(postId);
  return [section, button];
};
const refreshPosts = async (postJSON) => {
  if (!postJSON) return undefined;
  const removeButtons = removeButtonListeners();
  const main = deleteChildElements(document.querySelector("main"));
  const fragment = await displayPosts(postJSON);
  const addButtons = addButtonListeners();
  return [removeButtons, main, fragment, addButtons];
};

const selectMenuChangeEventHandler = async (event) => {
  if (!event) return;
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.disabled = true;
  const userId = event.target.value || 1;
  const postsJSON = await getUserPosts(userId);
  const refreshPostsArray = await refreshPosts(postsJSON);
  selectMenu.disabled = false;
  return [userId, postsJSON, refreshPostsArray];
};

const initPage = async () => {
  const usersJSON = await getUsers();
  const select = populateSelectMenu(usersJSON);
  return [usersJSON, select];
};

const initApp = () => {
  initPage();
  const selectMenu = document.getElementById("#selectMenu");
  selectMenu.addEventListener("change", selectMenuChangeEventHandler(event));
};
document.addEventListener("DOMContentLoaded", (event) => initApp());
