import { getPresswallAppNavLinks } from "@/lib/presswall-app-nav-contract";
import { getPresswallNavPaths } from "@/lib/presswall-nav-paths";

export function PresswallAppNav() {
  const [homeLink, editorLink] = getPresswallAppNavLinks(
    getPresswallNavPaths()
  );

  return (
    <div aria-hidden="true" className="presswall-app-nav-host">
      <s-app-nav>
        <a href={homeLink.href} rel={homeLink.rel}>
          {homeLink.label}
        </a>
        <a href={editorLink.href}>{editorLink.label}</a>
      </s-app-nav>
    </div>
  );
}
