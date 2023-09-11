const KEY = "ck_8f86f3fb005d4794534ae27a3041a8aa0ee8bd26";
const SECRET = "cs_d95fd78ddca6e5feaba93d084890273e232e03ea";
const DOMAIN = "http://neel.local";
const EXT = "/wp-json/wc/v3"; // extension
let siGlobalId; // select item global id
let atcGlobalId;  // add to cart global id
let raceBlocker = "false";






// --- EventListener "beforeunload" to send event data to GTM if page reloads ---

window.addEventListener("beforeunload", async function (e) {

  if (siGlobalId) {
    let operation = "select_item";
    let dlContent = await getDLReadyContent(pId, operation);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

  if (atcGlobalId) {
    let operation = "add_to_cart";
    let dlContent = await getDLReadyContent(pId, operation);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

});








// --- OnClick functions (set global variables values) ---

window.onclick = async function(e) {

  let el = e.target;
  let className = "";

  if (el) {
    className = el.className;
  }

  // Select item
  if (el.closest(".ga-wc-product") !== null) {
    let parentEl = el.closest(".ga-wc-product");  // Ta linia zwróci nasz parent element, który zawiera atrybut product-id
    let pId = parentEl.getAttribute("product-id");
    siGlobalId = pId;
    let operation = "select_item";
    let dlContent = await getDLReadyContent(pId, operation);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

  // Add to cart
  if (className !== null && className.includes("add_to_cart_button")) {
    let pId = el.getAttribute("value"); // jeżeli będzie to przycisk na stronie produktu, to znajdziemy atrybut value
    if (!pId) { // w innym wypadku bedzie to przycisk na pozostalych stronach i musimy znalezc atrybut data-product_id
      pId = el.dataset.product_id;
    }
    atcGlobalId = pId; // nasza zmienna globalna, ktora bedzie potrzebna do funkcji z listenerem beforeunload
    // \/   następnie standardowy zestaw instrukcji do wypchania danych oraz beforeunload'a
    let operation = "add_to_cart";
    let dlContent = await getDLReadyContent(pId, operation);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
    // /\
  }

}



// --- Using datalayer to push data ---

window.onload = async function(e) {
  var cartSummary = document.getElementById("site-header-cart");
  cartSummary.addEventListener("mouseenter", dataLayerOperation);

  // View Item
  if (window.location.pathname.includes("/product/")) {
    let el = document.querySelector(".type-product");
    let htmlElId = el.id;
    let arr = htmlElId.split("-");
    let pId = arr[1];
    let operation = "view_item";
    let dlContent = await getDLReadyContent(pId, operation);
    pushToDataLayer(dlContent);
  }

  // View Item List
  let els = document.querySelectorAll(".ga-wc-product");
  let pIds = [];

  if (els.length > 0) {
    for (let i = 0; i < els.length; i++) {
      let pId = els[i].getAttribute("product-id");
      if (!pIds.includes(pId)) {
        pIds.push(pId);
      }
    }
    let operation = "view_item_list";
    let dlContent = await getDLReadyContent(pId, operation);
    pushToDataLayer(dlContent);
  }

}


function pushToDataLayer(dataReady) {
  dataLayer.push({ecommerce: null});
  dataLayer.push(dataReady);
}


function dataLayerOperation() {
  dataLayer.push({
    "event": "summary_cart_seen",
    "page": window.location.pathname 
  });
}






// --- Implement WooCommerce REST API Authentication ---

async function fetchFromRest(need = "/products") {

  // nonce
  const nonce = getNonceString(9);
  // timestamp
  const ts = Math.floor((new Date().getTime()) / 1000);
  // Oauth Signature
  const authType = "HMAC-SHA1";
  // Version
  const version = "1.0";
  // oAuth Signature
  const signature = generateSignature(ts, nonce, authType, version, need);
  let requestString = DOMAIN + EXT + need + "?oauth_consumer_key=" + KEY + 
    "&oauth_signature_method=" + authType + "&oauth_timestamp=" + ts + 
    "&oauth_nonce=" + nonce + "&oauth_version=" + version + 
    "&oauth_signature=" + signature;

  let requestOptions = {
                          method: "GET",
                          redirect: "follow"
                       }
  let res = await fetch(requestString, requestOptions);
  let resJSON = await res.json();
  console.log(resJSON);
  return resJSON;
}


function generateSignature(ts, nonce, authType, version, need) {
  const secretPrepared = SECRET + "&";
  let base = "GET&" +
              encodeURIComponent(DOMAIN + EXT + need) + "&" +
              encodeURIComponent("oauth_consumer_key=" + KEY) +
              encodeURIComponent("&oauth_nonce=" + nonce) +
              encodeURIComponent("&oauth_signature_method=" + authType) +
              encodeURIComponent("&oauth_timestamp=" + ts) +
              encodeURIComponent("&oauth_version=" + version);
  let signature = CryptoJS.HmacSHA1(base, secretPrepared);
  let signB64 = signature.toString(CryptoJS.enc.Base64);
  return encodeURIComponent(signB64);
}


function getNonceString(length) {
  let nonce = "";
  const options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    nonce += options.charAt(Math.floor(Math.random() * options.length));
  }
  return nonce;
}





// --- Creating JS Framework for Data Collection ---

async function getDLReadyContent(pIds, operation) {
  
  let dataList = [];
  for (let i = 0; i < pIds.length; i++) {
    // need url
    let need = prepareRESTURL(pIds[i]);
    // fetch function
    let data = await fetchFromRest(need);
    dataList.push(data);
  }

  // format it the way datalayer needs
  let dlContent = structureForDL(dataList, operation);
  return dlContent;
}


function prepareRESTURL(pId = -1) {

  let need = "";

  if (pId !== -1) {
    need = "/products/" + pId;
  }
  return need;
}


function structureForDL(dataList, operation) {

  // create the items object
  let dlItemsData = prepareDLItems(dataList, operation);

  // create the datalayer object
  let dlContent = structureDataForDL(dlItemsData, operation);

  return dlContent;
}


function structureDataForDL(dlItemsData, operation) {
  
  let dlObj = {};
  dlObj.event = operation;
  dlObj.ecommerce = {};
  dlObj.ecommerce.currency = "USD";
  dlObj.ecommerce.value = 7.77;
  dlObj.ecommerce.items = dlItemsData;

  return dlObj;
}


function prepareDLItems(dataList, operation) {

  let items = [];

  // Every loop generate informations about one item
  for (let i = 0; i < dataList.length; i++) {
    
    let data = dataList[i];
    let item = {};
    item.item_id = data.id;
    item.item_name = data.name;
    item.affiliation = "Online Store";  // inaczej sklep
    // coupon = "SUMMER_FUN";
    // discount = 2.22;
    item.index = 1;
    item.item_brand = "Neel";
    item.item_category = data.categories[0].name;
    // item_list_id = "related_products";
    // item_list_name = "Related Products";
    // item_variant = "green";
    item.price = data.price;
    item.quantity = 1
    items.push(item);

  }

  return item;
}


