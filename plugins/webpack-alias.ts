import path from 'path';

export default function webpackAliasPlugin() {
  return {
    name: 'webpack-alias-plugin',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@ignix-ui': path.resolve(
              process.cwd(),
              'node_modules/@mindfiredigital/ignix-ui/components'
            ),
          },
        },
      };
    },
  };
}
