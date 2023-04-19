import { FormControl } from "@angular/forms";

export class CustomValidators {
  static validateEmails(c: FormControl) {
    console.log(c);
    const EMAIL_REGEXP = /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    let inValid = null;
    c.value.forEach((item) => {
      if (!EMAIL_REGEXP.test(item)) {
        inValid = { email: true };
      }
    });
    return inValid;
  }

  static validateRequired(c: FormControl) {
    console.log(c);
    if (c.value.length === 0) {
      return { required: true };
    } else {
      return null;
    }
  }

  static validateDotAtFirstChar(c: FormControl) {
    console.log(c);
    if (c.value) {
      let splChars = "*|,\":<>[]{}`';()@&$#%!^?'-=+/.0";
      console.log(splChars.indexOf(c.value.charAt(0)) != -1);
      if (splChars.indexOf(c.value.charAt(0)) != -1) {
        console.log("Dot is there");
        return { dotAtFirst: true };
      } else if (c.value.charAt(0) === "\\") {
        console.log("Dot is there /");
        return { dotAtFirst: true };
      } else {
        return null;
      }
    }
  }

  static validateDot(c: FormControl) {
    console.log(c);
    if (c.value) {
      let value = c.value.toString();
      if (value.includes(".")) {
        console.log("Dot is there");
        return { dot: true };
      } else {
        return null;
      }
    }
  }
}
