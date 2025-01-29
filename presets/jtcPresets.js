import { getFunctionBodyString } from "../utils.js";

// json-to-csv transformer must take an object as its input argument
// and should return an array of objects with the same data structure,
// allowing it to be converted into a CSV format
function TRANSFORMER_EXAMPLE(data) {
  data.records.push({
    name: "John",
    age: 25,
    employed: true,
  });

  return data.records;
}

function getGoogleMapsMarkers(data) {
  const markers = data.markers.map(
    ({
      position,
      coordinates,
      infoTitle,
      infoDescription,
      infoImage,
      infoAddress,
      infoSite,
      infoPhone,
      infoEmail,
      infoWorkingHours,
    }) => ({
      // Location: position,
      Location: coordinates,
      Name: infoTitle,
      Description: infoDescription,
      "Image URL": typeof infoImage === "object" ? infoImage?.url : infoImage,
      Address: infoAddress,
      Website: infoSite,
      Phone: infoPhone,
      Email: infoEmail,
      "Working Hours": infoWorkingHours,
    })
  );

  return markers;
}

function getRestaurantMenuItems(data) {
  return data.menus.flatMap((menu) => {
    const menuName = menu.name;

    return menu.items.map((item) => {
      const {
        name: itemName,
        description: itemDescription,
        price: itemPrice,
      } = item;

      return {
        menuName,
        itemName,
        itemDescription,
        itemPrice,
      };
    });
  });
}

function getTSTestimonials(data) {
  function removeHtmlTags(str) {
    return str?.replace(/<[^>]*>/g, '');
  }
  
  function getFormattedTestimonial(itemData) {
    const {
      reviewer_name,
      text,
      caption,
      picture,
      logo,
      rating,
      socialProfileUrl,
      websiteUrl,
      date = {}
    } = itemData;
  
    return {
      Name: removeHtmlTags(reviewer_name),
      Caption: removeHtmlTags(caption),
      Date: date?.date ? `${date.date} ${date.time}` : null,
      Picture: picture?.url || null,
      Text: removeHtmlTags(text),
      Rating: rating,
      'Social Profile URL': socialProfileUrl,
      Website: websiteUrl,
      Logo: logo?.url || null
    };
  }
  
  return data.items.map(getFormattedTestimonial);
}

window.presets = [
  {
    name: "Google Maps: выгрузить локации",
    description:
      "Выгружает из локации из конфига Google Maps в формате, который может быть импортирован в виджет",
    code: getFunctionBodyString(getGoogleMapsMarkers),
  },
  {
    name: "Restaurant Menu: выгрузить блюда",
    description:
      "Выгружает из конфига RM блюда в формате: { <имя_меню_блюда>, <имя_блюда>, <описание_блюда>, <цена_блюда> }",
    code: getFunctionBodyString(getRestaurantMenuItems),
  },
  {
    name: "Testimonials Slider: выгрузить отзывы",
    description:
      "Выгружает из конфига TS отзывы в формате: { <имя>, <подпись>, <дата>, <ссылка_на_изображение_профиля>, <текст_отзыва>, <рейтинг>, <ссылка_на_профиль_в_соцсети>, <ссылка_на_вебсайт>, <ссылка_на_изображение_логотипа> }",
    code: getFunctionBodyString(getTSTestimonials),
  },
];
