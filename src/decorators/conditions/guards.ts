const email =
  "^[-a-z0-9~!$%^&*_=+}{'?]+(.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(.[-a-z0-9_]+[a-z][a-z])|([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}))(:[0-9]{1,5})?$";

export const isEmail = s => new RegExp(email).test(s);

/* tslint:disable */
// https://gist.github.com/hillerstorm/6816840
const isPINValid = function(a, b, c, d) {
  c = '';
  for (b = d = 0; b < 10; b++) c += b != 6 ? a[b] * (d++ % 2 || 2) : '';
  b = 0;
  for (d in c) b += c[d] * 1;
  return (b * 9) % 10 == a[10];
};
/* tslint:enable */

/**
 * The personal identity number is a 4-digit number following your date of birth in
 * the format: YYMMDD-XXXX.
 *
 * It is obtained when you are registered in the Swedish population register.
 * It is widely used for everyday purposes in Swedish society such as setting up
 * memberships and subscriptions, establishing a banking relationship with a Swedish
 * bank, joining an insurance plan and will entitle you to the same patient fees as
 * Swedish citizens for most public health care. You need to have a personal identity
 * number to apply for a Swedish ID-card at the Tax Agency.
 */
export const isPIN = (s: string) =>
  isPINValid(s.indexOf('-') === 6 ? s : s.substr(2), 0, '', 0);
