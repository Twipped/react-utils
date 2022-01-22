/* globals process */

const env = (process.env.NODE_ENV).toUpperCase();

export default function Env ({ target = [ 'production' ], children }) {
  if (!Array.isArray(target)) target = [ target ];

  const yes = target.some((v) => String(v).toUpperCase() === env);
  return yes ? children : null;
}

Env.Dev = (props) => <Env {...props} target={[ 'development', 'dev' ]} />;
Env.Prod = (props) => <Env {...props} target={[ 'production', 'prod' ]} />;
