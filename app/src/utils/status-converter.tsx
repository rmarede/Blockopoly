export function saleStatusColor(status: number) {
    switch (status) {
        case 0:
          return "#646cff";
        case 1:
          return "#ffc164";
        case 2:
          return "#56e46d";
        case 3:
          return "#ff5e5e";
        default:
          return "#e064ff";
      }
}

export function saleStatusName(status: number) {
    switch (status) {
        case 0:
          return "Pending";
        case 1:
          return "Agreed";
        case 2:
          return "Completed";
        case 3:
          return "Withdrawn";
        default:
          return "Unknown";
      }
}