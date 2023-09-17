const KEY = "ck_8f86f3fb005d4794534ae27a3041a8aa0ee8bd26";
const SECRET = "cs_d95fd78ddca6e5feaba93d084890273e232e03ea";
const DOMAIN = "http://neel.local";
const EXT = "/wp-json/wc/v3";
let siGlobalIds = [];
let atcGlobalIds = [];
let globalVariations = [];
let globalVariationPrices = [];
let globalQuantities = [];
let raceBlocker = "false";
let initialQtysInCart;



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
    let dlContent = await getDLReadyContent(siGlobalIds, operation, globalVariations, globalVariationPrices, globalQuantities);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

  if (atcGlobalIds > 0) {
    let operation = "add_to_cart";
    let dlContent = await getDLReadyContent(atcGlobalIds, operation, globalVariations, globalVariationPrices, globalQuantities);
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
    let quantities = [1];
    globalVariations = variations;
    globalVariationPrices = variationPrices;
    globalQuantities = quantities;
    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities);
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
    let quantity = document.querySelector(".qty").value;
    let quantities = [quantity];

    if (document.querySelector(".variation_id")) {
      variations.push(document.querySelector(".variation_id").getAttribute("value"));
      variationPrices.push(document.querySelector(".woocommerce-variation-price>.price>.woocommerce-Price-amount").dataset.price);
    } else {
      variations.push(-1);
      variationPrices.push(-1);
    }
    globalVariations = variations;
    globalVariationPrices = variationPrices;
    globalQuantities = quantities;
    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities);
    if (raceBlocker === "false") {
      pushToDataLayer(dlContent);
    }
    raceBlocker = "true";
  }

  // Remove from cart
  if (className.includes("ga-wc-remove")) {
    let pIds = [];
    let variations = [];
    let variationPrices = [];
    let quantities = [];

    if (el.dataset.variation_id !== el.dataset.product_id) { 
      variations.push(el.dataset.variation_id);
      variationPrices.push(el.dataset.price);
    } else {
      variations.push(-1);
      variationPrices.push(-1);
    }
    pIds.push(el.dataset.product_id);
    quantities.push(el.dataset.quantity);
    operation = "remove_from_cart";
    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities);
    pushToDataLayer(dlContent);
  }

  // Update Cart
  if (className.includes("ga-wc-update-cart")) {
    updateCart();
  }

}



window.onload = async function(e) {

  var cartSummary = document.getElementById("site-header-cart");
  cartSummary.addEventListener("mouseenter", dataLayerOperation);

  // Save Cart Quantity
  if (window.location.pathname === "/cart/") {
    setCartQuantities();
  }

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
  let quantities = [];

  if (els.length > 0) {
    for (let i = 0; i < els.length; i++) {
      let pId = els[i].getAttribute("product-id");
      if (!pIds.includes(pId)) {
        pIds.push(pId);
        variations.push(-1);
        variationPrices.push(-1);
        quantities.push(1);
      }
    }

    populateDynamicData(pIds);
    let operation = "view_item_list";
    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities);
    pushToDataLayer(dlContent);
  }

  // Checkout
  if (window.location.pathname === "/checkout/") {
    let els = document.querySelectorAll(".ga-wc-product-name");
    if (els.length > 0) {
      let pIds = [];
      let variations = [];
      let variationPrices = [];
      let quantities = [];

      for (let i = 0; i < els.length; i++) {
        let parentId = els[i].dataset.parentId;
        let productId = els[i].dataset.productId;
        let quantity = els[i].dataset.quantity;
        let price = els[i].dataset.price;

        if (parentId === "0") {
          pIds.push(productId);
          variations.push(-1);
          variationPrices.push(-1);
        } else {
          pIds.push(parentId);
          variations.push(productId);
          variationPrices.push(price);
        }
        quantities.push(quantity);
      }

      operation = "begin_checkout";
      let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities);
      pushToDataLayer(dlContent);
    }
  }

  // Order Placed
  if (window.location.pathname.includes("/order-received/")) {
    let brokenPath = window.location.pathname.split("/");
    let orderId = brokenPath[3];
    operation = "purchase";
    let orderContent = await getOrderData(orderId);
    let orderContentForDL = prepareOrderData(orderContent);
    let lineItems = orderContent.line_items;
    let pIds = [];
    let variations = [];
    let variationPrices = [];
    let quantities = [];

    for (let i = 0; i < lineItems.length; i++) {
      pIds.push(lineItems[i].product_id);
      quantities.push(lineItems[i].quantity);
      let variation = lineItems[i].variation_id;

      if (parseInt(variation) > 0) {
        variations.push(variation);
        variationPrices.push(lineItems[i].price);
      } else {
        variations.push(-1);
        variationPrices.push(-1);
      }
    }

    let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities, orderContentForDL);
    pushToDataLayer(dlContent);
  }

}



async function getOrderData(oId) {

  let need = "/orders/" + oId;
  let data = await fetchFromREST(need);
  return data;

}



function prepareOrderData(orderContent) {
  
  let order = {};
  order.transaction_id = orderContent.id;
  order.affiliation = "Online Store";
  order.value = orderContent.total;
  order.tax = orderContent.total_tax;
  order.shipping = orderContent.shipping_total;
  order.currency = orderContent.currency;
  order.discount_total = orderContent.discount_total;
  order.payment_method = orderContent.payment_method;
  return order;

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
  let quantities = [1];

  let operation = "view_item";
  let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities);
  pushToDataLayer(dlContent);

}



function setCartQuantities() {

  initialQtysInCart = {};
  let qtys = document.querySelectorAll(".qty");
  for (let i = 0; i < qtys.length; i++) {
    let qty = qtys[i].value;
    let qEl = qtys[i].closest(".ga-wc-remove");
    let prodId = qEl.dataset.product_id;
    let variationId = qEl.dataset.variation_id;

    if (variationId === prodId) {
      initialQtysInCart[prodId] = qty;
    } else {
      initialQtysInCart[variationId] = qty;
    }
  }

}



function updateCart() {

  let qtys = document.querySelectorAll(".qty");

  for (let i = 0; i < qtys.length; i++) {
    let qty = qtys[i].value;
    let qEl = qtys[i].closest(".ga-wc-remove");
    let prodId = qEl.dataset.product_id;
    let variationId = qEl.dataset.variation_id;
    let price = qEl.dataset.price;

    let id = parseInt(prodId) === parseInt(variationId) ? prodId : variationId;
    let initq = parseInt(initialQtysInCart[id]);
    let currq = parseInt(qty);

    if (currq > initq) {
      let operation = "add_to_cart";
      let q = currq - initq;
      updateCartSend(parseInt(prodId), parseInt(variationId), price, operation, q);
    } else if (currq < initq) {
      let operation = "remove_from_cart";
      let q = initq - currq;
      updateCartSend(parseInt(prodId), parseInt(variationId), price, operation, q);
    } else {
      // Do nothing
    }
  }

}



async function updateCartSend(prodId, variationId, price, operation, q) {

  let pIds = [];
  let variations = [];
  let variationPrices = [];
  let quantities = [];

  if (prodId === variationId) {
    variations.push(-1);
    variationPrices.push(-1);
  } else {
    variations.push(variationId);
    variationPrices.push(price);
  }
  pIds.push(prodId);
  quantities.push(q);

  let dlContent = await getDLReadyContent(pIds, operation, variations, variationPrices, quantities);
  pushToDataLayer(dlContent);
  setCartQuantities();

}





//**************************[ DATALAYER PUSH FRAMEWORK ]**************************



function pushToDataLayer(dataReady) {

  dataLayer.push({ecommerce: null});
  dataLayer.push(dataReady);

}



async function getDLReadyContent(pIds, operation, variations, variationPrices, quantities, orderContentForDL) {
  
  let dataList = [];

  for (let i = 0; i < pIds.length; i++) {
    let need = prepareRESTURL(pIds[i]);
    let data = await fetchFromREST(need);
    dataList.push(data);
  }

  let dlContent = structureForDL(dataList, operation, variations, variationPrices, quantities, orderContentForDL);
  return dlContent;

}



function prepareRESTURL(pId = -1) {

  let need = "";

  if (pId !== -1) {
    need = "/products/" + pId;
  }
  return need;

}



function structureForDL(dataList, operation, variations, variationPrices, quantities, orderContentForDL) {

  let dlItemsData = prepareDLItems(dataList, operation, variations, variationPrices, quantities);
  let dlContent = structureDataForDL(dlItemsData, operation, orderContentForDL);
  return dlContent;

}



function structureDataForDL(dlItemsData, operation, orderContentForDL) {
  
  let dlObj = {};
  dlObj.event = operation;
  dlObj.ecommerce = {};
  if (orderContentForDL) {
    dlObj.ecommerce.transaction_id = orderContentForDL.transaction_id;
    dlObj.ecommerce.affiliation = orderContentForDL.affiliation;
    dlObj.ecommerce.value = orderContentForDL.value;
    dlObj.ecommerce.tax = orderContentForDL.tax;
    dlObj.ecommerce.shipping = orderContentForDL.shipping;
    dlObj.ecommerce.currency = orderContentForDL.currency;
    dlObj.ecommerce.discount_total = orderContentForDL.discount_total;
    dlObj.ecommerce.payment_method = orderContentForDL.payment_method;
  }

  dlObj.ecommerce.items = dlItemsData;
  return dlObj;

}



function prepareDLItems(dataList, operation, variations, variationPrices, quantities) {

  let items = [];

  for (let i = 0; i < dataList.length; i++) {
    let data = dataList[i];
    let variation = variations[i];
    let price = -1;
    let quantity = quantities[i];

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
    item.currency = "USD";
    item.index = position;
    item.item_brand = "Neel";
    item.item_category = data.categories[0].name;
    item.item_list_id = itemListId;
    item.item_list_name = itemListName;
    item.item_variant = variation;
    item.price = price;
    item.quantity = quantity;
    items.push(item);

  }

  return items;

}



async function fetchFromREST(need = "/products") {

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


