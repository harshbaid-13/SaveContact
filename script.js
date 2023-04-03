const fileInput = document.getElementById("inputTag");
const myForm = document.getElementById("myForm");
const submitBut = document.getElementById("submit-but");
const results = document.querySelector(".results");
const inputLabel = document.querySelector("label");
const loader = document.querySelector(".loader");
const textResults = document.querySelector(".text p");
const textHeading = document.querySelector(".text h2");
const workers = document.querySelector(".workers");
const whatsapp = document.getElementById("whatsapp");
const call = document.getElementById("call");

function showError(errorMessage) {
  loader.style.display = "none";
  workers.style.display = "none";
  textHeading.innerHTML = "ERROR";
  textResults.innerHTML = errorMessage;
}

function modify(data) {
  console.log(data);
  const phoneRegex = /(\+91|0)?(\d{5}(\s)?\d{5})\b/g;
  const phoneNumbers = data.match(phoneRegex);
  return phoneNumbers ? phoneNumbers[0].replace(/\s/g, "") : "";
}

const compressImage = async (file, { quality = 1, type = file.type }) => {
  // Get as image data
  const imageBitmap = await createImageBitmap(file);

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0);

  // Turn into Blob
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
  return new File([blob], file.name, {
    type: blob.type,
  });
};
fileInput.addEventListener("change", (e) => {
  console.log(e);
  submitBut.style.display = "block";
  inputLabel.style.display = "none";
});
myForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  myForm.style.display = "none";
  submitBut.style.display = "none";
  loader.style.display = "flex";
  const endpoint = "https://api.ocr.space/parse/image";
  const formData = new FormData();
  const compressedFile = await compressImage(fileInput.files[0], {
    // 0: is maximum compression
    // 1: is no compression
    quality: 0.1,
    type: "image/jpeg",
  });
  console.log(compressedFile);
  console.log(fileInput.files[0]);
  formData.append("inputTag", compressedFile);
  let options = {
    method: "POST",
    headers: {
      apikey: "9733a4cd7d88957",
    },
    body: formData,
  };
  fetch(endpoint, options)
    .then((res) => res.json())
    .then(
      (data) => {
        console.log(data);
        if (data.ParsedResults) {
          const actualtext = modify(data.ParsedResults[0].ParsedText);
          if (actualtext) {
            results.style.display = "flex";
            loader.style.display = "none";
            textResults.innerHTML = actualtext;
            whatsapp.href = "http://wa.me/+91" + actualtext;
            call.href = "tel:" + actualtext;
            console.log(actualtext);
          } else {
            results.style.display = "flex";
            showError("No Mobile Number found!");
          }
        } else {
          results.style.display = "flex";
          showError("No Mobile Number found!");
        }
      },
      (error) => {
        console.log(error);
        results.style.display = "flex";
        showError("Server is slow! Please try again!");
      }
    );
});
