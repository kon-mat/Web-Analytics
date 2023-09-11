
// ===========[ Learning DOM ]=========== 


// EXAMINE THE DOCUMENT OBJECT //

// console.dir(document);          // wszystkie dostepne polecenia dla obiektu document
// console.log(document.domain);   // neel.local
// console.log(document.URL);      // http://neel.local/
// console.log(document.title);    // neel – Just another WordPress site
// // document.title = 123;        // title może zostać zmianiony
// console.log(document.doctype);  // <!DOCTYPE html>
// console.log(document.head);     // wyswietli zawartosc elementu head
// console.log(document.body);     // wyswietli zawartosc elementu body
// console.log(document.all);      // wyswietli kolekcje wszystkich elementow DOM - na naszej stronie
// // document.all[10].textContent = 'Hello';  // odwolujac sie w ten sposob mozemy zmieniac wartosc
// console.log(document.forms);    // zwroci kolekcje formularzy <form>
// console.log(document.links);    // zwroci kolekcje liinkow <a>
// console.log(document.images);      // zwroci kolekcje obrazkow <img>



// GETELEMENTBYID //

// console.log(document.getElementById("tab-description"));
// var element = document.getElementById("tab-description"); // odnosimy do elementu sie za pomoca id
// console.log(element.textContent); // textContent zachowuje stylowanie
// console.log(element.innerText);



// GETELEMENTSBYCLASSNAMME //

// var items = document.getElementsByClassName('product');
// console.log(items);
  
// window.onclick = function() {
//   for (let i = 0; i < items.length; i++) {
//     console.log(items[i].textContent);
//   }
// }



// QUERYSELECTOR //
// działa tak samo jak getElementsByClassName, ale odwołuje się do taga HTML



// QUERYSELECTOR //

//  # - id
//  . - class
//  $ - CSS

// window.onclick = function() {
//   var search = document.querySelector('form[role="search"]');
//   console.log(search);
// }



// QUERYSELECTORALL //

// window.onclick = function() {
//   var pageItems = document.querySelectorAll('.page_item');
//   console.log(pageItems);
//   pageItems[1].textContent = 'Zmiana tekstu';
// }



// TRAVERSING THE DOM //

// window.onclick = function() {
//   var products = document.querySelector('.products');

//   // // parentNode - rodzic obiektu
//   // console.log(products.parentNode);
//   // // parentElement - rowniez rodzic elementu
//   // console.log(products.parentElement);

//   // // childNodes - dzieci
//   // console.log(products.childNodes);
//   // // children - dzieci (lepsza wersja)
//   // console.log(products.children);

//   // // firstChild - pierwsze dziecko (niestety zwraca rowniez whitespace text, czyli jest useless)
//   // console.log(products.firstChild);
//   // // firstChild - pierwsze dziecko (bez whitespace)
//   // console.log(products.firstElementChild);

//   // // nextElementSibling - kolejny element tego samego poziomu
//   // console.log(products.nextElementSibling);
//   // // previousElementSibling - poprzedni element tego samego poziomu
//   // console.log(products.previousElementSibling);
// }







// ===========[ Using JS for GTM ]=========== 


// --- Capture rating data from website review form (stars) ---
// window.onclick = function() {
//   var ratings = document.querySelectorAll("#commentform > div > p > span > a");

//   for (var i = 0; i < ratings.length; i++) {
//     var elClass = ratings[i].className;
//     if (elClass && elClass.includes("active")) {
//       return i + 1;
//     }
//   }
//   return "NA";
// }



// --- Fetch product name from URL ---
// function capture() {
//   var url = {{Page URL}};

//   if (url.includes("/product/")) {
//     var titleEl = document.getElementsByClassName("product_title");
//     var product_name = titleEl[0].textContent;  // pobieramy pierwszy element z listy
//     return product_name;
//   }

//   return "NA";
// }



// --- Click closest element from parent ---
// window.onclick = function(e) {
//   let el = e.target;
  
//   const parent = el.closest(".storefront-primary-navigation");  
  
//   if (parent) {  
//     const title = parent.querySelector(".woocommerce-loop-product__title");
//     const productName = title.textContent;
//     console.log(productName);
//   }
    
// }



// --- Click menu item ---
// window.onclick = function(e) {
//   var el = e.target;

//   var parent = el.parentNode;

//   if (parent.className && parent.className.includes("page_item")) {
//     var elText = el.textContent;
//     console.log(elText);
//   } else if (el.closest(".nav-menu") && el.nodeName === "A") {
//     var elText = el.textContent;
//     console.log(elText);
//   }
     
// }