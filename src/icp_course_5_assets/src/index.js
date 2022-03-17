import { icp_course_5 } from "../../declarations/icp_course_5";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from '../../declarations/icp_course_5/icp_course_5.did.js';

function createActor(canisterId) {
  const agent = new HttpAgent();
  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  });
}

function toLocaleDate(s) {
  let ss = s.toString().substr(0,13)*1;
  return new Date(ss).toLocaleString();
}

async function post() {
  let post_button = document.getElementById("post");
  post_button.disabled = true;

  let error = document.getElementById("error");
  error.innerText = "";

  let textarea = document.getElementById("message");
  let text = textarea.value;

  let otp = document.getElementById("otp").value;

  try {
    await icp_course_5.post(otp, text);
    textarea.value = "";
  } catch(err) {
    console.log(err);
    error.innerText = "Post Failed";
  }

  post_button.disabled = false;
}

function get_html_from_post(p) {
  let post = document.createElement("p");
      
  let text = document.createElement("div");
  text.innerText = p.text;

  let time = document.createElement("div");
  time.innerText = toLocaleDate(p.time);

  let author = document.createElement("div");
  author.innerText = p.author;

  post.insertBefore(author, null);
  post.insertBefore(text, null);
  post.insertBefore(time, null);

  return post;
}

var num_posts = 0;
async function load_posts() {
  let posts = await icp_course_5.posts(0);
  if (posts.length == num_posts) return;
  
  num_posts = posts.length;
  let post_sec = document.getElementById("posts");
  post_sec.replaceChildren([]);

  console.log(posts);
  for(var i = 0; i < posts.length; i++) {
    post_sec.appendChild(get_html_from_post(posts[i]));
  }
}

var num_follows = 0;
async function load_follows() {
  let follows = await icp_course_5.follows();
  if (follows.length == num_follows) return;
  
  num_follows = follows.length;
  let follows_sec = document.getElementById("follows");
  follows_sec.replaceChildren([]);

  console.log(follows);
  console.log(follows.length);
  for(var i = 0; i < follows.length; i++) {
    console.log(i);
    let principalID = (follows[i]).toString();
    let act = createActor(principalID);
    let name = await act.get_name();

    let a = document.createElement("a");
    a.setAttribute("href", 'javascript:void(0)');
    a.appendChild(document.createTextNode(name + " [" + principalID + "]"));
    follows_sec.appendChild(a);

    let posts = await act.posts(0);

    for(var j = 0; j < posts.length; j++) {
      follows_sec.appendChild(get_html_from_post(posts[j]));
    }
  }
}

var num_timeline = 0;
async function load_timeline() {
  let timeline = await icp_course_5.timeline(0);
  if (timeline.length == num_timeline) return;
  
  num_timeline = timeline.length;
  let timeline_sec = document.getElementById("timeline");
  timeline_sec.replaceChildren([]);

  console.log(timeline);
  for(var i = 0; i < timeline.length; i++) {
    timeline_sec.appendChild(get_html_from_post(timeline[i]));
  }
}

function load() {
  let post_button = document.getElementById("post");
  post_button.onclick = post;

  load_posts();
  setInterval(load_posts, 3000);
  
  load_follows();
  setInterval(load_follows, 3000);

  load_timeline();
  setInterval(load_timeline, 3000);
}

window.onload = load;
