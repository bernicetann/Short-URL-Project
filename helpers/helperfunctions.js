module.exports = {
  generatedRand: function() {
    var text = "";
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 6; i++)
      text = text + possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
}
