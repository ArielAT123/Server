export function extractHashtags(text = "") {
    const regex = /#(\w+)/g;
    return [...text.matchAll(regex)].map((match) => match[1].toLowerCase());
  }
  
  export function extractMentions(text = "") {
    const regex = /@(\w+)/g;
    return [...text.matchAll(regex)].map((match) => match[1].toLowerCase());
  }
  