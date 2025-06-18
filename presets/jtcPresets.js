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

function getGMMarkers(data) {
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

function getRMItems(data) {
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
    return str?.replace(/<[^>]*>/g, "");
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
      date = {},
    } = itemData;

    return {
      Name: removeHtmlTags(reviewer_name),
      Caption: removeHtmlTags(caption),
      Date: date?.date ? `${date.date} ${date.time}` : null,
      Picture: picture?.url || null,
      Text: removeHtmlTags(text),
      Rating: rating,
      "Social Profile URL": socialProfileUrl,
      Website: websiteUrl,
      Logo: logo?.url || null,
    };
  }

  return data.items.map(getFormattedTestimonial);
}

function getECEvents(data) {
  const findById = (src = [], id = "") =>
    src.find(({ id: itemId }) => id === itemId);

  const { events, hosts, locations, eventTypes } = data;

  return events.map((event) => {
    const {
      name,
      start,
      end,
      timeZone,
      description,
      image,
      eventType: eventTypeId,
      location: locationId,
      host: hostId,
      repeatPeriod,
      repeatFrequency,
      repeatInterval,
      repeatEnds,
      repeatEndsDate,
      repeatEndsOccurrences,
      repeatMonthlyOnDay,
    } = event;

    const eventTypeName = findById(eventTypes, eventTypeId)?.name ?? "";
    const { name: locationName, address: locationAddress } =
      findById(locations, locationId) ?? {};
    const hostName = findById(hosts, hostId)?.name ?? "";

    return {
      name,
      description,
      imageUrl: image?.url ?? "",
      timeZone,
      startDatetime: `${start.date} ${start.time}`,
      endDatetime: `${end.date} ${end.time}`,
      repeatPeriod,
      repeatFrequency,
      repeatInterval,
      repeatEnds,
      repeatEndsDate,
      repeatEndsOccurrences,
      repeatMonthlyOnDay,
      eventTypeName,
      locationName,
      locationAddress,
      hostName,
    };
  });
}

window.presets = [
  {
    name: "Google Maps: выгрузить локации",
    description:
      "Выгружает из локации из конфига Google Maps в формате, который может быть импортирован в виджет",
    code: getFunctionBodyString(getGMMarkers),
  },
  {
    name: "Restaurant Menu: выгрузить блюда",
    description: "Выгружает блюда из конфига RM",
    code: getFunctionBodyString(getRMItems),
  },
  {
    name: "Testimonials Slider: выгрузить отзывы",
    description: "Выгружает отзывы из конфига TS",
    code: getFunctionBodyString(getTSTestimonials),
  },
  {
    name: "Event Calendar: выгрузить события",
    description: "Выгружает события из конфига EC",
    code: getFunctionBodyString(getECEvents),
  },
];
