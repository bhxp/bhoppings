{ pkgs }: {
  deps = [
    pkgs.nodejs
  ];

  shellHook = ''
    export NODE_ENV=development
  '';
}