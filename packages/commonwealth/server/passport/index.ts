import { StatsDController } from 'common-common/src/statsd';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import { JWT_SECRET } from '../config';
import type { DB } from '../models';
import '../types';
import { useMagicAuth } from './magic';
import { useSocialAccountAuth } from './socialAccount';

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

function useDefaultUserAuth(models: DB) {
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([
          ExtractJWT.fromBodyField('jwt'),
          ExtractJWT.fromUrlQueryParameter('jwt'),
          ExtractJWT.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          models.User.scope('withPrivateData')
            .findOne({ where: { id: jwtPayload.id } })
            .then((user) => {
              if (user) {
                // note the return removed with passport JWT - add this return for passport local
                done(null, user);
              } else {
                done(null, false);
              }
            });
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

export function setupPassport(models: DB) {
  useDefaultUserAuth(models);
  useSocialAccountAuth(models);
  useMagicAuth(models);

  passport.serializeUser<any>((user, done) => {
    StatsDController.get().increment('cw.users.logged_in');
    if (user?.id) {
      StatsDController.get().set('cw.users.unique', user.id);
    }
    done(null, user.id);
  });

  passport.deserializeUser((userId, done) => {
    models.User.scope('withPrivateData')
      .findOne({ where: { id: userId } })
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });
}

export default setupPassport;
