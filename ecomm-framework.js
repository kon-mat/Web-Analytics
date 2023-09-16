const KEY = "ck_8f86f3fb005d4794534ae27a3041a8aa0ee8bd26";
const SECRET = "cs_d95fd78ddca6e5feaba93d084890273e232e03ea";
const DOMAIN = "http://neel.local";
const EXT = "/wp-json/wc/v3";
let siGlobalIds = [];
let atcGlobalIds = [];
let globalVariations = [];
let globalVariationPrices = [];
let raceBlocker = "false";



var observer = new MutationObserver(async function(mutations) {

  let runTimes = 0;
  for (let i = 0; i < mutations.length; i++) {
    if (mutations[i].type === "attributes") {
      if (runTimes === 0) {
        runTimes = 1;
        executeViewItem();
      }
    }
  }

});



window.addEventListener("beforeunload", async function (e) {

  if (siGlobalIds > 0) {
    let operation = "select_item";
    let dlContent = await getDLReadyContent(siGlobalIds, operation, globalVariations, globalVariationPrices);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

  if (atcGlobalIds > 0) {
    let operation = "add_to_cart";
    let dlContent = await getDLReadyContent(atcGlobalIds, operation, globalVariations, globalVariationPrices);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

});



window.onclick = async function(e) {

  let el = e.target;
  let className = "";

  if (el) {
    className = el.className;
  }

  // Select item
  if (el.closest(".ga-wc-product") !== null) {
    let parentEl = el.closest(".ga-wc-product");
    let pId = parentEl.getAttribute("product-id");
    let pIds = [];
    pIds.push(pId);
    siGlobalIds = pIds;
    let operation = "select_item";
    let variations = [-1];
    let variationPrices = [-1];
    globalVariations = variations;
    globalVariationPrices = variationPrices;
    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

  // Add to cart
  if (className !== null && className.includes("add_to_cart_button")) {
    let pId = el.getAttribute("value");
    if (!pId) {
      pId = el.dataset.product_id;
    }
    let pIds = [];
    pIds.push(pId);
    atcGlobalIds = pIds;
    let operation = "add_to_cart";
    let variations = [];
    let variationPrices = [];
    if (document.querySelector(".variation_id")) {
      variations.push(document.querySelector(".variation_id").getAttribute("value"));
      variationPrices.push(document.querySelector(".woocommerce-variation-price>.price>.woocommerce-Price-amount").dataset.price);
    } else {
      variations.push(-1);
      variationPrices.push(-1);
    }
    globalVariations = variations;
    globalVariationPrices = variationPrices;
    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

}



window.onload = async function(e) {

  var cartSummary = document.getElementById("site-header-cart");
  cartSummary.addEventListener("mouseenter", dataLayerOperation);

  let variationEl = document.querySelector(".variation_id");
  if (variationEl) {
    observer.observe(variationEl, {attributes: true});
  }

  // View Item
  if (window.location.pathname.includes("/product/")) {
    executeViewItem();
  }

  // View Item List
  let els = document.querySelectorAll(".ga-wc-product");
  let pIds = [];
  let variations = [];
  let variationPrices = [];

  if (els.length > 0) {
    for (let i = 0; i < els.length; i++) {
      let pId = els[i].getAttribute("product-id");
      if (!pIds.includes(pId)) {
        pIds.push(pId);
        variations.push(-1);
        variationPrices.push(-1);
      }
    }

    populateDynamicData(pIds);
    let operation = "view_item_list";
    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices);
    pushToDataLayer(dlContent);
  }

}





//**************************[ HELPER FUNCTIONS ]**************************



function dataLayerOperation() {

  dataLayer.push({
    "event": "summary_cart_seen",
    "page": window.location.pathname 
  });

}



function populateDynamicData(ids) {

  for (let i = 0; i < ids.length; i++) {
    let info = {};
    info.index = i + 1;
    info.item_list_id = window.location.pathname;
    info.item_list_name = window.location.pathname;
    sessionStorage.setItem(ids[i], JSON.stringify(info));
  }

}



async function executeViewItem() {
  let el = document.querySelector(".type-product");
  let htmlElId = el.id;
  let arr = htmlElId.split("-");
  let pId = arr[1];
  let pIds = [];
  pIds.push(pId);

  let variations = [];
  let variationPrices = [];
  let variationEl = document.querySelector(".variation_id");
  let variationPricesEl = document.querySelector(".woocommerce-variation-price>.price>.woocommerce-Price-amount");

  if (variationPricesEl) {
    variations.push(variationEl.getAttribute("value"));
    variationPrices.push(variationPricesEl.dataset.price);
  } else {
    variations.push(-1);
    variationPrices.push(-1);
  }

  let operation = "view_item";
  let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices);
  pushToDataLayer(dlContent);
}





//**************************[ DATALAYER PUSH FRAMEWORK ]**************************



function pushToDataLayer(dataReady) {

  dataLayer.push({ecommerce: null});
  dataLayer.push(dataReady);

}



async function getDLReadyContent(pIds, operation, variations, variationPrices) {
  
  let dataList = [];
  for (let i = 0; i < pIds.length; i++) {
    let need = prepareRESTURL(pIds[i]);
    let data = await fetchFromRest(need);
    dataList.push(data);
  }

  let dlContent = structureForDL(dataList, operation, variations, variationPrices);
  return dlContent;

}



function prepareRESTURL(pId = -1) {

  let need = "";

  if (pId !== -1) {
    need = "/products/" + pId;
  }
  return need;

}



function structureForDL(dataList, operation, variations, variationPrices) {

  let dlItemsData = prepareDLItems(dataList, operation, variations, variationPrices);
  let dlContent = structureDataForDL(dlItemsData, operation);
  return dlContent;

}



function structureDataForDL(dlItemsData, operation) {
  
  let dlObj = {};
  dlObj.event = operation;
  dlObj.ecommerce = {};
  dlObj.ecommerce.items = dlItemsData;

  return dlObj;

}



function prepareDLItems(dataList, operation, variations, variationPrices) {

  let items = [];

  for (let i = 0; i < dataList.length; i++) {
    
    let data = dataList[i];
    let variation = variations[i];
    let price = -1;

    if (parseInt(variationPrices[i]) !== -1) {
      price = variationPrices[i];
    } else {
      price = data.price;
    }

    let itemListId = "none";
    let itemListName = "none";
    let position = -1;
    let info = sessionStorage.getItem(data.id);

    if (info) {
      info = JSON.parse(info);
      itemListId = info.item_list_id;
      itemListName = info.item_list_name;
      position = info.index;
    }

    let item = {};
    item.item_id = data.id;
    item.item_name = data.name;
    item.affiliation = "Online Store";
    item.currency= "USD";
    item.index = position;
    item.item_brand = "Neel";
    item.item_category = data.categories[0].name;
    item.item_list_id = itemListId;
    item.item_list_name = itemListName;
    item.item_variant = variation;
    item.price = price;
    item.quantity = 1
    items.push(item);

  }

  return items;

}



async function fetchFromRest(need = "/products") {

  const nonce = getNonceString(9);
  const ts = Math.floor((new Date().getTime()) / 1000);
  const authType = "HMAC-SHA1";
  const version = "1.0";
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


