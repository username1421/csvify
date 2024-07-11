import { getFunctionBodyString } from "../utils.js";

// json-to-csv transformer must take an object as its input argument 
// and should return an array of objects with the same data structure, 
// allowing it to be converted into a CSV format
function TRANSFORMER_EXAMPLE(data) {
  data.records.push({
    name: 'John',
    age: 25,
    employed: true
  });

  return data.records;
}

function getGoogleMapsMarkers(data) {
  const markers = data.markers.map(({
    position,
    coordinates,
    infoTitle,
    infoDescription,
    infoImage,
    infoAddress,
    infoSite,
    infoPhone,
    infoEmail,
    infoWorkingHours
  }) => ({
    position,
    coordinates,
    infoTitle,
    infoDescription,
    infoImageUrl: typeof infoImage === 'object' ? infoImage?.url : infoImage,
    infoAddress,
    infoSite,
    infoPhone,
    infoEmail,
    infoWorkingHours
  }));

  return markers;
}

function getRestaurantMenuItems(data) {
  return data.menus.flatMap((menu) => {
    const menuName = menu.name;

    return menu.items.map((item) => {
      const { name: itemName, description: itemDescription, price: itemPrice } = item;

      return {
        menuName,
        itemName,
        itemDescription,
        itemPrice
      };
    });
  });
}

window.presets = [
  {
    name: "Google Maps: выгрузить локации",
    description: "Достаёт и очищает локации из конфига Google Maps",
    code: getFunctionBodyString(getGoogleMapsMarkers),
  },
  {
    name: "Restaurant Menu: выгрузить блюда",
    description: "Достаёт из конфига RM блюда в формате: { <имя_меню_блюда>, <имя_блюда>, <описание_блюда>, <цена_блюда> }",
    code: getFunctionBodyString(getRestaurantMenuItems)
  }
];
