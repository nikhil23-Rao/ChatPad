export function urlify(text: string) {
  var urlRegex = /(?:(?:https?|ftp|file|data):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
  const uriRegex = /src="(data:image\/[^;]+;base64[^"]+)"/i;
  return [text.match(urlRegex), text.match(uriRegex)];
}
