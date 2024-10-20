export function removeAndExportEvents(data) {
  const DATES_OF_EVENTS_TO_DELETE = {
    from: {
      y: 1970,
      m: 1,
      d: 1,
    },
    until: {
      y: 2024,
      m: 1,
      d: 1,
    },
  };

  const toastInfo = { message: "", type: "info" };

  function isDateNewer(d1, d2) {
    return (
      d1.y > d2.y ||
      (d1.y === d2.y && d1.m > d2.m) ||
      (d1.y === d2.y && d1.m === d2.m && d1.d > d2.d)
    );
  }

  function compareDates(d1, d2) {
    if (isDateNewer(d1, d2)) {
      return 1;
    }

    if (isDateNewer(d2, d1)) {
      return -1;
    }

    return 0;
  }

  function compareDatesSign(d1, d2) {
    return Math.sign(
      Math.sign(d1.y - d2.y) * 100 +
        Math.sign(d1.m - d2.m) * 10 +
        Math.sign(d1.d - d2.d)
    );
  }

  function parseIntDate(intDate) {
    const date = new Date(intDate);

    const parsedDate = {
      y: date.getFullYear(),
      m: date.getMonth(),
      d: date.getDay(),
    };

    if (
      !Number.isInteger(parsedDate.y) ||
      !Number.isInteger(parsedDate.m) ||
      !Number.isInteger(parsedDate.d)
    ) {
      console.error("Unable to parse date: ", intDate);

      toastInfo.message = `Unable to parse date: ${intDate}`;
      toastInfo.type = "error";

      return;
    }

    return parsedDate;
  }

  function parseStrDate(strDate) {
    const dateParts = strDate.split("-");

    if (dateParts.length !== 3) {
      console.error("Unable to parse date: ", strDate);

      toastInfo.message = `Unable to parse date: ${strDate}`;
      toastInfo.type = "error";

      return;
    }

    for (const part of dateParts) {
      if (!Number.isInteger(+part)) {
        console.error("Unable to parse date: ", strDate);

        toastInfo.message = `Unable to parse date: ${strDate}`;
        toastInfo.type = "error";

        return;
      }
    }

    return {
      y: +dateParts[0],
      m: +dateParts[1],
      d: +dateParts[2],
    };
  }

  function parseEventDate(date) {
    if (Number.isInteger(date)) {
      return parseIntDate(date);
    }

    if (typeof date === "string") {
      return parseStrDate(date);
    }

    console.error("Unable to parse date: ", date);

    toastInfo.message = `Unable to parse date: ${date}`;
    toastInfo.type = "error";
  }

  function findById(src = [], id = "") {
    return src.find(({ id: itemId }) => id === itemId);
  }

  function extractEventsInfo({ events, hosts, locations, eventTypes }) {
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
        eventTypeName,
        locationName,
        locationAddress,
        hostName,
      };
    });
  }

  const events = data?.events;

  if (events) {
    const remainedEvents = [];
    const rejectedEvents = [];

    for (const event of events) {
      const startDate = parseEventDate(
        event?.start?.date ?? event?.start ?? ""
      );
      const endDate = parseEventDate(event?.end?.date ?? event?.end ?? "");

      const startRes =
        startDate &&
        compareDates(startDate, DATES_OF_EVENTS_TO_DELETE.from) === 1;

      const endRes =
        endDate &&
        compareDates(endDate, DATES_OF_EVENTS_TO_DELETE.until) === -1;

      const shouldRemove = startRes && endRes;

      if (shouldRemove) {
        rejectedEvents.push(event);
      } else {
        remainedEvents.push(event);
      }
    }

    console.log(
      `All events: ${data.events.length},\nRemoved events: ${rejectedEvents.length},\nEvents remained: ${remainedEvents.length}`
    );

    toastInfo.message = `All events: ${data.events.length},\nRemoved events: ${rejectedEvents.length},\nEvents remained: ${remainedEvents.length}`;
    toastInfo.type = "info";

    const { hosts, locations, eventTypes } = data;

    const extractedEvents = extractEventsInfo({
      events: rejectedEvents,
      hosts,
      locations,
      eventTypes,
    });

    data.events = remainedEvents;

    return [data, extractedEvents, toastInfo];
  }

  return [data, [], toastInfo];
}
