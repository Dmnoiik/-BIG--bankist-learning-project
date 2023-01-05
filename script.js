'use strict';

const nav = document.querySelector('.nav');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const section2 = document.querySelector('#section--2');
const message = document.createElement('div');
const header = document.querySelector('.header');

///////////////////////////////////////
// Modal window

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// for (let i = 0; i < btnsOpenModal.length; i++)
//   btnsOpenModal[i].addEventListener('click', openModal);
btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

////////////////////////////////////////////////////////////////////////////////////
/////////////////// Event Delegation: Implementing Page Navigation

/// Without event delegation
// document.querySelectorAll('.nav__link').forEach((el, i) =>
//   el.addEventListener('click', function (e) {
//     e.preventDefault();

//     /// My solution
//     // const section = document.querySelector(`#section--${i + 1}`);
//     // section.scrollIntoView({ behavior: 'smooth' });

//     /// Jonas's solution
//     const id = this.getAttribute('href');
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   })
// );

/// With event delegation
// 1. Add event listener to common parent element
// 2. Determine what element originated the event
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  // Matching strategy
  // check if target has a class called nav__link
  if (e.target.classList.contains('nav__link')) {
    console.log('LINK');
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

//////////////////////////////////////////////////////////////////////////////
///////////////////////////// TABBED COMPONENT

/// Event delegation
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  // Guard clause (if statement that will return early if some condition is matched). Modern way!!!!!1
  if (!clicked) return;

  // 1. Remove active class from every tab and tabContent
  // 2. Add active class to clicked tab
  // 3. Add active class to tabContent associated with clicked tab

  // Remove active classes
  tabsContent.forEach(tabContent =>
    tabContent.classList.remove('operations__content--active')
  );
  tabs.forEach(tab => tab.classList.remove('operations__tab--active'));

  // Activate tab
  clicked.classList.add('operations__tab--active');

  // Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Menu fade animation

const handleHover = function (e, opacity) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');
    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

/// Passing "argument" into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));

nav.addEventListener('mouseout', handleHover.bind(1));

///////////// Sticky navigation (Old way)
// const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords);
// window.addEventListener('scroll', function (e) {
//   if (this.window.scrollY > initialCoords.top) nav.classList.add('sticky');
//   else nav.classList.remove('sticky');
// });

//// Sticky navigation: Intersection Observer API

// const obsCallback = function (entries, observer) {
//   // whenever section1 is intersecting the viewport in 10% (threshold) then this function will be called. No matter if scrolling up or down

//   entries.forEach(entry => {
//     console.log(entry);
//   });
// };
// const obsOptions = {
//   root: null, // enire viewport if null
//   threshold: [0, 0.2], /// when to start intersecting (50% means that it will be intersecting the section 1 in the middle of it)
// };

// const observer = new IntersectionObserver(obsCallback, obsOptions);

const navHeight = nav.getBoundingClientRect();
const stickyNav = function (entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight.height}px`, /// box of -90px placed outside of observered element
});
headerObserver.observe(header);

////////////////// REVEALING ELEMENTS ON SCROLL

const allSections = document.querySelectorAll('.section');
const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null, // if set to null, then root is the viewport
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  // section.classList.add('section--hidden');
});

// Lazy loading images
const imgTargets = document.querySelectorAll('img[data-src]');
const loadImg = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;

  /// Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  /// remove the lazy-img class when everything is loaded
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });
  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
});

imgTargets.forEach(imgTarget => imgObserver.observe(imgTarget));

/////////////////////////////////////////////////////////////////////////////
//////////////// SLIDER

const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const slider = document.querySelector('.slider');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let currentSlide = 0;
  const maxSlide = slides.length; // length of nodelist

  //// Functions
  const createDots = function () {
    slides.forEach((_, index) => {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${index}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document.querySelectorAll('.dots__dot').forEach(dot => {
      dot.classList.remove('dots__dot--active');
    });
    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, index) =>
        (s.style.transform = `translateX(${100 * (index - slide)}%)`)
    );
  };

  const nextSlide = function () {
    if (currentSlide === maxSlide - 1) {
      currentSlide = 0; /// get back to first slide when there is no more
    } else {
      currentSlide++;
    }

    goToSlide(currentSlide);
    activateDot(currentSlide);
  };

  const prevSlide = function () {
    if (currentSlide === 0) {
      currentSlide = maxSlide - 1;
    } else {
      currentSlide--;
    }
    goToSlide(currentSlide);
    activateDot(currentSlide);
  };

  // Initialization
  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };

  init();
  ///// Event handlers
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      currentSlide = Number(e.target.dataset.slide);
      goToSlide(currentSlide);
      activateDot(currentSlide);
    }
  });
};
slider();
// currentSlide = 1: -100%, 0%, 100%, 200%

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// HOW THE DOM REALLY WORKS
// 1. Allows us to make Javascript interact with the browser
// 2. Dom tree is generated from an HTML document, which we can then interact with;
// 3. DOM is a very complex API that contains lots of methods and properties to interact with the DOM tree
/*
///////////////////////////////////////////////////////////////
////////////// SELECTING, CREATING AND DELETING ELEMENTS

/// Selecting elements
console.log(document.documentElement); /// selects entire document
console.log(document.head); /// selects head
console.log(document.body); /// selects body

const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section');
console.log(allSections);

console.log(document.getElementById('section--1'));

const allButtons = document.getElementsByTagName('button'); /// all buttons, stored in HTMLCollection. If dom changes, then this collection updates automatically
console.log(allButtons);

const allBtnClasses = document.getElementsByClassName('btn');
console.log(allBtnClasses);
// Creating and inserting elements
// .insertAdjacentHTML -> easy way to create elements

const message = document.createElement('div'); /// creates DOM object element, but it is not in the DOM yet
message.classList.add('cookie-message');
// message.textContent = 'We use cookies for improved functionality and analytics';
message.innerHTML =
  'We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie">Got it!</button>';
// header.prepend(message); /// adds elements as a FIRST child
header.append(message); /// ads element as a LAST child.
// // It can't be prepended and appended at the same time. Element will be moved from being first child (prepend) to being the last child (append)
// header.append(message.cloneNode(true)); /// cloningt the message so it can be appended and prepended at the same time

/// insert element before (sibling) and after (also sibling)
// header.before(message);
// header.after(message);

// Delete elements
document
  .querySelector('.btn--close-cookie')
  .addEventListener('click', function () {
    // recent approach
    message.remove();

    /// old way -> DOM traversing. Moving element up and down
    // message.parentElement.removeChild(message);
  });
*/
///////////////////////////////////////////////////////
///////////// Styles, attributes, classes

/////// COOKIE MESSAGE
// message.classList.add('cookie-message');
// message.innerHTML =
//   'We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie">Got it!</button>';
// header.append(message);
// document
//   .querySelector('.btn--close-cookie')
//   .addEventListener('click', function () {
//     message.remove();
//   });

// // Styles
// message.style.backgroundColor = '#37383d';
// message.style.width = '120%';
// header.style.overflow = 'hidden';
// // console.log(message.style.backgroundColor); /// works only for inline styles (those we added using style property)
// // console.log(getComputedStyle(message)); /// object with all css properties
// // console.log(getComputedStyle(message).height);
// message.style.height =
//   Number.parseFloat(getComputedStyle(message).height, 10) + 30 + 'px';
/*
document.documentElement.style.setProperty('--color-primary', 'orangered'); /// selects and changes the variable of css (in :root which is the same as document in js). SetProperty can be used for anything, for example message.style.setProperty()

// Attributes
const logo = document.querySelector('.nav__logo');
console.log(logo.alt);
console.log(logo.src);
console.log(logo.className);

logo.alt = 'Beautiful minimalist logo'; /// changing the attribute alt
logo.setAttribute('company', 'Bankist'); /// set an attribute for element (1arg = name of attribute, 2arg = content)

console.log(logo.designer); /// undefined even though we added it manually
console.log(logo.getAttribute('designer')); /// returns 'Jonas'

console.log(logo.src); /// Absolute URL path
console.log(logo.getAttribute('src')); /// Relative URL path as in HTML element

const link = document.querySelector('.nav__link--btn');
console.log(link.href); /// absolute url
console.log(link.getAttribute('href')); /// hash as typed in HTML

/// Data attributes
console.log(logo.dataset.versionNumber); /// get attribute, versionNumber is a camel case version of html

/// Classes
logo.classList.add('c', 'j'); /// add class
logo.classList.remove('c', 'j'); /// remove class
logo.classList.toggle('c'); /// toggle class
logo.classList.contains('c'); /// check if contains class name

// Don't use this. It overwrites all existing classes
logo.className = 'jonas';
*/
///////////////////////////////////////////////////////
/////////// IMPLEMENTING SMOOTH SCROLLING

/*
btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords);

  console.log(e.target.getBoundingClientRect()); /// e.target is the element we use event listener on (btnScrollTo button)

  console.log('Current scroll (X/Y)', window.pageXOffset, window.pageYOffset); /// X is for horizontal scroll, y is for vertical scroll

  console.log(
    'height/width viewport',
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );

  // Scrolling
  // window.scrollTo(
  //   s1coords.left + window.pageXOffset, /// position of the button from left + position of horizontal scroll
  //   s1coords.top + window.pageYOffset /// position of the button from top + position of vertical scroll
  // );
  /////// Old way
  window.scrollTo({
    left: s1coords.left + window.pageXOffset,
    top: s1coords.top + window.pageYOffset,
    behavior: 'smooth',
  }); /// to make smooth scrolling behavior we need to specify left property, top property and behavior property with value of smooth

  ///////////////// Modern way!!!
  section1.scrollIntoView({
    behavior: 'smooth',
  });
});
 btnScrollTo.addEventListener('click', function (e) {
   const s2coords = section2.getBoundingClientRect();
   window.scrollTo({
     left: s2coords.left + window.pageXOffset,
     top: s2coords.top + window.pageYOffset,
     behavior: 'smooth',
  });
 });
*/
////// MODERN WAY
btnScrollTo.addEventListener('click', function (e) {
  section1.scrollIntoView({
    behavior: 'smooth',
  });
});

///////////////////////////////////////////////
//////////// Types of events and event handlers
/*
const h1 = document.querySelector('h1');

const alertH1 = function (e) {
  alert('addEventListener: Great! You are reading the heading :D');

  /// Remove event handler
  // h1.removeEventListener('mouseenter', alertH1);
};

h1.addEventListener('mouseenter', alertH1);

setTimeout(() => h1.removeEventListener('mouseenter', alertH1), 3000);

/// second way of attaching events (a bit old school)
// h1.onmouseenter = function (e) {
//   alert('onmouseenter: Great! You are reading the heading :D');
// };
///////////////////////////////////////////////////////////////
//////////// EVENT PROPAGATION: BUBBLING AND CAPTURING (In practice)
// Event handlers happen from child element all the way up to parents elements

// rgb(255, 255, 255)
const randomInt = (max, min) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomColor = () =>
  `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`;

console.log(randomColor());

document.querySelector('.nav__link').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('LINK', e.target, e.currentTarget); // e target is where the event happened not where it was attached

  // stop propagation -> event never arives to parent elements (generally not good idea)
  // e.stopPropagation();
});

document.querySelector('.nav__links').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('CONTAINER', e.target, e.currentTarget);
});

document.querySelector('.nav').addEventListener(
  'click',
  function (e) {
    this.style.backgroundColor = randomColor();
    console.log('NAV', e.target, e.currentTarget);
  }
  // true /// third argument enables capturing phase. By default its set to false
);

/////////////////////////////////////////////////////////////
///////// DOM TRAVERSING

const h1 = document.querySelector('h1');

// Going downwards: child
console.log(h1.querySelectorAll('.highlight')); // select based on element and not document
console.log(h1.childNodes); /// gets every child node, including comments etc
console.log(h1.children); /// HTML collection with direct children
h1.firstElementChild.style.color = 'white';
h1.lastElementChild.style.color = 'orangered';

// Going upwards: parent
console.log(h1.parentNode);
console.log(h1.parentElement);

/// selects closest header to h1
h1.closest('.header').style.background = 'var(--gradient-secondary)'; /// query string like querySelector/querySelectorALl
h1.closest('h1').style.background = 'var(--gradient-primary)'; /// closest can be seen as opossite to querySelecter. Closest find parents, querySelector finds children

// Going sideways: sibling (only direct)
console.log(h1.previousElementSibling);
console.log(h1.nextElementSibling);

console.log(h1.previousSibling);
console.log(h1.nextSibling);

console.log(h1.parentElement.children);


/// Work on every sibling of a element
[...h1.parentElement.children].forEach(function (el) {
  if (el !== h1) el.style.transform = 'scale(0.5)';
});
/////////////////////////////////////////////////////////////////
/////////////// LIFECYCLE DOM EVENTS
document.addEventListener('DOMContentLoaded', function (e) {
  /// does not wait for images and external resources to load
  console.log('HTML parsed and DOM tree built!', e);
});
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});

/// Alert would be displayed when user closes the page (DON'T ABUSE)
window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  console.log(e);
  e.returnValue = '';
});
*/

////////////////////////////////////////////////////
////////////// DEFER AND ASYNC SCRIPT LOADING
// DEFER tag in head (<script defer src='script.js'>) is overall the best solution. Scripts are fetched asynchronously and executed after the HTML is completely parsed. DOMContentLoaded event fires AFTER defer script is executed.
