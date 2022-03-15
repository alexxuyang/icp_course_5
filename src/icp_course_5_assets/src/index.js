import { icp_course_5 } from "../../declarations/icp_course_5";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from '../../declarations/icp_course_5/icp_course_5.did.js';

BigInt.prototype.toJSON = function() {
  let s = this.toString().substr(0,13)*1;
  return new Date(s).toLocaleString();
}

function createActor(canisterId) {
  const agent = new HttpAgent();
  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  });
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

var num_posts = 0;
async function load_posts() {
  let posts = await icp_course_5.posts(0);
  if (posts.length == num_posts) return;
  
  num_posts = posts.length;
  let post_sec = document.getElementById("posts");
  post_sec.replaceChildren([]);

  console.log(posts);
  for(var i = 0; i < posts.length; i++) {
    let post = document.createElement("p");
    post.innerText = JSON.stringify(posts[i]);
    post_sec.appendChild(post);
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
  for(var i = 0; i < follows.length; i++) {
    let act = createActor((follows[i]).toString());
    let name = await act.get_name();

    let a = document.createElement("a");
    a.setAttribute("href","#");
    a.appendChild(document.createTextNode(name + " [" + (follows[i]).toString() + "]"));

    let follow = document.createElement("p");
    follow.insertBefore(a, null);
    follows_sec.appendChild(follow);
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
    let tl = document.createElement("p");
    tl.innerText = JSON.stringify(timeline[i]);
    timeline_sec.appendChild(tl);
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
  setInterval(load_timeline, 3000)
}

window.onload = load;
