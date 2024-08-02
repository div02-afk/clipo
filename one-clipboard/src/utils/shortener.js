export default function shortener(text) {
  if (text.length > 50) {
    return text.slice(0, 50) + "...";
  }
  return text;
}
