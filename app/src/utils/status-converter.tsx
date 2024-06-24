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
          return "Complete";
        case 3:
          return "Withdrawn";
        default:
          return "Unknown";
      }
}

export function rentalStatusColor(status: number) {
  switch (status) {
      case 0:
        return "#646cff";
      case 1:
        return "#56e46d";
      case 2:
          return "#ffc164";
      case 3:
        return "#ff5e5e";
      default:
        return "#e064ff";
    }
}

export function rentalStatusName(status: number) {
  switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Active";
      case 2:
        return "Complete";
      case 3:
        return "Terminated";
      default:
        return "Unknown";
    }
}

export function mortgageStatusColor(status: number) {
  switch (status) {
      case 0:
        return "#646cff";
      case 1:
        return "#56e46d";
      case 2:
          return "#ffc164";
      case 3:
        return "#ff5e5e";
      case 4:
        return "#ff5e5e";
      default:
        return "#e064ff";
    }
}

export function mortgageStatusName(status: number) {
  switch (status) {
      case 0:
        return "TBD";
      case 1:
        return "Pending";
      case 2:
        return "Active";
      case 3:
        return "Terminated";
      case 4:
        return "Foreclosed";
      default:
        return "Unknown";
    }
}