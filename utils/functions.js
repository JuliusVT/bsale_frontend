export const queryParams = (source) => {
    var array = [];
    for(var key in source) {
        array.push(encodeURIComponent(key) + "=" + encodeURIComponent(source[key]));
    }
    return array.join("&");
}