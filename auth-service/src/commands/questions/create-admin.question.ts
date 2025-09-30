import { Question, QuestionSet } from 'nest-commander';
import Validator from 'validatorjs';
import { questionConstants } from '../command.constant';

@QuestionSet({ name: questionConstants.createAdmin })
export class CreateAdminQuestions {
  @Question({
    type: 'input',
    message: 'Please enter admin username:',
    name: 'username',
    validate: async function (username: string) {
      Validator.register(
        'checkUsername',
        function (value: any) {
          return value.match(/^[a-zA-Z0-9_.]+$/);
        },
        'Username may only contain letters (a–z, A–Z), digits (0–9), underscores (_) and periods (.)',
      );
      let rules = { username: 'required|string|min:6|max:30|checkUsername' };
      let validation = new Validator({ username: username }, rules);
      if (validation.fails()) {
        const firstErrors = validation.errors.first('username');
        console.error('firstError::', firstErrors);

        return false;
      }
      return true;
    },
  })
  parseUsername(username: string) {
    return username;
  }

  @Question({
    type: 'input',
    message: 'Please enter admin password:',
    name: 'password',
    validate: function (password: string) {
      Validator.register(
        'checkPassword',
        function (value: any) {
          return value.match(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z]).*$/);
        },
        'Password too weak',
      );
      let rules = { password: 'required|string|min:8|max:64|checkPassword' };
      let validation = new Validator({ password: password }, rules);
      if (validation.fails()) {
        const firstErrors = validation.errors.first('password');
        console.error('firstError::', firstErrors);

        return false;
      }

      return true;
    },
  })
  parsePw(password: string) {
    return password;
  }

  @Question({
    type: 'input',
    message: 'Please enter admin email:',
    name: 'email',
    validate: async function (email: string) {
      let rules = {
        email: 'required|string|email',
      };
      let validation = new Validator({ email: email }, rules);
      if (validation.fails()) {
        const firstErrors = validation.errors.first('email');
        console.error('firstError::', firstErrors);

        return false;
      }

      return true;
    },
  })
  parseEmail(email: string) {
    return email;
  }
}
