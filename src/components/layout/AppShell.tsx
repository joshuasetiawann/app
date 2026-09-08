import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { pcss } from '../../lib/pcss';
import { useAppState } from '../../state/AppState';
import { RIGHT_RAIL_ROUTES } from '../../lib/nav';
import { Sidebar } from './Sidebar';
import { Topbar, ViewportSwitcher } from './Topbar';
import { BottomTabBar } from './BottomTabBar';
import { RightRail } from './RightRail';
import { Toast } from '../shared/Toast';
import { PhotoViewer } from '../shared/PhotoViewer';
import { BottomSheet } from '../shared/BottomSheet';

function LittleSparkles() {
  return (
    <div className="kk-little-sparkles kk-decorative" aria-hidden="true">
      <span>♡</span><span>✧</span><span>♡</span><span>✧</span>
    </div>
  );
}

export function AppShell() {
  const { viewport, vpForce, cssVars, offline, reduced, animLevel } = useAppState();
  const location = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pauseMotion = () => {
      if (shellRef.current) shellRef.current.dataset.backgrounded = String(document.hidden);
    };
    pauseMotion();
    document.addEventListener('visibilitychange', pauseMotion);
    return () => document.removeEventListener('visibilitychange', pauseMotion);
  }, []);

  const showSidebar = viewport === 'tablet' || viewport === 'laptop' || viewport === 'desktop';
  const showRight = (viewport === 'desktop' || viewport === 'laptop') && RIGHT_RAIL_ROUTES.has(location.pathname);
  const isMobile = viewport === 'mobile';
  const showSparkles = animLevel === 'full' && !reduced && location.pathname !== '/chat';
  const forced = !!vpForce && (vpForce === 'mobile' || vpForce === 'tablet');

  return (
    <div ref={shellRef} className={`kk-app kk-motion-${animLevel}`} style={{ ...cssVars, height: '100dvh', fontFamily: "'Quicksand',system-ui,sans-serif" }}>
      <div
        style={pcss(
          `position:relative;height:100%;display:flex;align-items:stretch;justify-content:center;padding:${forced ? '44px 20px 20px' : '0'};background:${forced ? '#EFE4E0' : 'var(--bg,#FDFBF7)'};overflow:hidden`,
        )}
      >
        {forced && <ViewportSwitcher floating />}
        <div
          style={pcss(
            `position:relative;overflow:hidden;width:${viewport === 'mobile' ? '390px' : viewport === 'tablet' ? '834px' : '100%'};max-width:1680px;height:${forced ? (viewport === 'mobile' ? '844px' : '1000px') : '100%'};max-height:100%;border-radius:${forced ? '34px' : '0'};box-shadow:${forced ? '0 26px 60px rgba(90,60,70,.28)' : 'none'};background:var(--bg,#FDFBF7);border:${forced ? '8px solid #2E2530' : 'none'}`,
          )}
        >
          {showSparkles && <LittleSparkles />}

          <div
            style={pcss(
              `display:grid;grid-template-columns:${showSidebar ? `${viewport === 'tablet' ? '76px' : '248px'} minmax(0,1fr)${showRight ? ' 316px' : ''}` : 'minmax(0,1fr)'};height:100%;overflow:hidden`,
            )}
          >
            {showSidebar && <Sidebar />}

            <main style={pcss('position:relative;display:flex;flex-direction:column;min-width:0;height:100%;overflow:hidden')}>
              <Topbar />

              {offline && (
                <div style={pcss('margin:0 16px 4px;padding:11px 14px;border-radius:16px;background:#FFF0D9;border:1px solid #F5D9A8;display:flex;align-items:center;gap:9px;animation:kk-up .25s ease')}>
                  <span style={{ fontSize: 15 }}>📡</span>
                  <span style={pcss("font:600 11.5px/1.4 'Nunito',sans-serif;color:#8A6B33")}>
                    You are offline. Messages will stay queued and send automatically when you reconnect. 💌
                  </span>
                </div>
              )}

              <div className={`kk-main-scroll${location.pathname === '/chat' ? ' kk-main-scroll-chat' : ''}`} style={pcss(`flex:1;overflow-y:${location.pathname === '/chat' ? 'hidden' : 'auto'};overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:${isMobile ? 'calc(82px + env(safe-area-inset-bottom))' : '26px'}`)}>
                <div className={`kk-route-enter${location.pathname === '/chat' ? ' kk-route-chat' : ''}`} key={location.pathname}>
                  <Outlet />
                  <div data-screens-end="1" />
                </div>
              </div>

              {isMobile && <BottomTabBar />}
            </main>

            {showRight && <RightRail />}
          </div>

          <Toast />
          <PhotoViewer />
          <BottomSheet />
        </div>
      </div>
    </div>
  );
}
