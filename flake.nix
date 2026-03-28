{
  description = "Smartsheet MCP server";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
  let
    system = "x86_64-linux";
    pkgs   = nixpkgs.legacyPackages.${system};
  in
  {
    packages.${system}.default = pkgs.buildNpmPackage {
      pname   = "smar-mcp";
      version = "1.6.0";

      src = self;

      npmDepsHash = "sha256-ykX9aRpizObGj7g5PgRoyu6XiYMa+pnu+g6RqRXqji8=";

      # tsc is run by the prepare/build script
      npmBuildScript = "build";

      installPhase = ''
        runHook preInstall
        mkdir -p $out/lib/smar-mcp
        cp -r build node_modules $out/lib/smar-mcp/
        mkdir -p $out/bin
        cat > $out/bin/smar-mcp <<EOF
        #!${pkgs.bash}/bin/bash
        exec ${pkgs.nodejs}/bin/node $out/lib/smar-mcp/build/index.js "\$@"
        EOF
        chmod +x $out/bin/smar-mcp
        runHook postInstall
      '';
    };

    nixosModules.default = { config, pkgs, lib, ... }:
    let
      cfg    = config.services.smar-mcp;
      domain = cfg.domain;
      port   = cfg.port;
      pkg    = cfg.package;

      startScript = pkgs.writeShellScript "smar-mcp-start" ''
        export SMARTSHEET_API_KEY=$(cat ${config.age.secrets.smartsheet-api-key.path})
        export JWT_SIGNING_KEY=$(cat ${config.age.secrets.smar-mcp-jwt-key.path})
        export SMARTSHEET_ENDPOINT="https://api.smartsheet.com/2.0"
        export PORT="${toString port}"
        export ISSUER_URL="https://${domain}"
        export NODE_ENV=production
        export ALLOW_DELETE_SUMMARY_FIELDS=true
        export SESSIONS_FILE="/var/lib/smar-mcp/sessions.json"
        exec ${pkgs.nodejs}/bin/node ${pkg}/lib/smar-mcp/build/index.js
      '';
    in
    {
      options.services.smar-mcp = {
        enable = lib.mkEnableOption "Smartsheet MCP server";

        package = lib.mkOption {
          type    = lib.types.package;
          default = self.packages.${pkgs.system}.default;
          description = "The smar-mcp package to use.";
        };

        domain = lib.mkOption {
          type    = lib.types.str;
          default = "mcp-smartsheet.cmplx.syntheticplayground.com";
          description = "Public domain for the MCP server.";
        };

        port = lib.mkOption {
          type    = lib.types.port;
          default = 3742;
          description = "Port the server listens on.";
        };

        apiKeyFile = lib.mkOption {
          type    = lib.types.path;
          description = "Path to the agenix-encrypted Smartsheet API key (.age file).";
        };

        jwtKeyFile = lib.mkOption {
          type    = lib.types.path;
          description = "Path to the agenix-encrypted JWT signing key (.age file).";
        };
      };

      config = lib.mkIf cfg.enable {
        # ── Agenix secrets ───────────────────────────────────────────────────
        age.secrets.smartsheet-api-key = {
          file  = cfg.apiKeyFile;
          owner = "smar-mcp";
          group = "smar-mcp";
          mode  = "0400";
        };

        age.secrets.smar-mcp-jwt-key = {
          file  = cfg.jwtKeyFile;
          owner = "smar-mcp";
          mode  = "0400";
        };

        # ── Service user ─────────────────────────────────────────────────────
        users.users.smar-mcp = {
          isSystemUser = true;
          group        = "smar-mcp";
          home         = "/var/lib/smar-mcp";
          description  = "Smartsheet MCP server";
        };
        users.groups.smar-mcp = {};

        # ── Systemd service ──────────────────────────────────────────────────
        systemd.services.smar-mcp = {
          description = "Smartsheet MCP Server";
          wantedBy    = [ "multi-user.target" ];
          after       = [ "network.target" ];

          serviceConfig = {
            ExecStart      = startScript;
            User           = "smar-mcp";
            Group          = "smar-mcp";
            Restart        = "on-failure";
            RestartSec     = "5s";
            StateDirectory = "smar-mcp";

            # Hardening
            NoNewPrivileges = true;
            PrivateTmp      = true;
            ProtectSystem   = "strict";
            ProtectHome     = "read-only";
          };
        };

        # ── Reverse proxy ────────────────────────────────────────────────────
        services.caddy.virtualHosts.${domain} = lib.mkIf config.services.caddy.enable {
          useACMEHost = "cmplx.syntheticplayground.com";
          extraConfig = ''
            @mcp path /mcp
            handle @mcp {
              @allowed remote_ip 160.79.104.0/21
              handle @allowed {
                reverse_proxy 127.0.0.1:${toString port}
              }
              respond 403
            }

            handle {
              reverse_proxy 127.0.0.1:${toString port}
            }
          '';
        };
      };
    };
  };
}
