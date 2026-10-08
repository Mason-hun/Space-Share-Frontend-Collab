const nextButtons = document.querySelectorAll(".next");
const skipButtons = document.querySelectorAll(".skip");
const continueButton = document.querySelector(".continue");
const cards = document.querySelectorAll(".card")


nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentSlide = button.closest(".slide");
    const nextSlide = currentSlide.nextElementSibling

    document.querySelector(".overlay").style.display = "block";

    setTimeout(() => {
      document.querySelector(".overlay").style.display = "none";
      currentSlide.classList.add("hidden");
      nextSlide.classList.remove("hidden");
    }, 500);
  });
});

cards.forEach((card)=> {
  card.addEventListener("click", () => {
    cards.forEach((card) => {
      card.classList.remove("selected")
    })
    card.classList.add("selected")
  })
})

skipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "login.html";
  });
});

continueButton.addEventListener("click", () => {
  window.location.href = "login.html";
});
