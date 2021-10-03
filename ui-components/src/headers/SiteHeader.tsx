import React, { useState, useEffect } from "react"
import { CSSTransition } from "react-transition-group"
import { LanguageNav, LangItem } from "../navigation/LanguageNav"
import { Icon } from "../icons/Icon"
import { Button } from "../actions/Button"
import { AppearanceSizeType } from "../global/AppearanceTypes"
import { t } from "../helpers/translator"
import "./SiteHeader.scss"

type LogoWidth = "slim" | "medium" | "wide"

export interface MenuLink {
  href?: string
  iconClassName?: string
  iconSrc?: string
  onClick?: () => void
  subMenuLinks?: MenuLink[]
  title: string
}

export interface SiteHeaderProps {
  dropdownItemClassName?: string
  homeURL?: string
  homeOnClick?: () => void
  imageOnly?: boolean
  languages?: LangItem[]
  logoClass?: string
  logoSrc: string
  logoWidth?: LogoWidth
  menuItemClassName?: string
  menuLinks: MenuLink[]
  mobileDrawer?: boolean
  mobileText?: boolean
  flattenSubMenus?: boolean
  notice?: string | React.ReactNode
  noticeMobile?: boolean
  title?: string
}

const SiteHeader = (props: SiteHeaderProps) => {
  const [activeMenus, setActiveMenus] = useState<string[]>([])
  const [activeMobileMenus, setActiveMobileMenus] = useState<string[]>([])
  const [isDesktop, setIsDesktop] = useState(true)
  const [mobileDrawer, setMobileDrawer] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const DESKTOP_MIN_WIDTH = 767 // @screen md
  // Enables toggling off navbar links when entering mobile
  useEffect(() => {
    if (window.innerWidth > DESKTOP_MIN_WIDTH) {
      setIsDesktop(true)
    } else {
      setIsDesktop(false)
    }

    const updateMedia = () => {
      if (window.innerWidth > DESKTOP_MIN_WIDTH) {
        setIsDesktop(true)
      } else {
        setIsDesktop(false)
      }
    }
    window.addEventListener("resize", updateMedia)
    return () => window.removeEventListener("resize", updateMedia)
  }, [])

  const getLogoWidthClass = () => {
    if (props.logoWidth === "slim") return "navbar-width-slim"
    if (props.logoWidth === "medium") return "navbar-width-med"
    if (props.logoWidth === "wide") return "navbar-width-wide"
    return ""
  }

  const menuAction = (menuHref: string | undefined, menuOnClick?: () => void) => {
    if (menuHref) {
      window.location.href = menuHref
    }
    if (menuOnClick) {
      menuOnClick()
    }
  }

  // Render set of styled menu links
  const getDropdownOptions = (
    options: MenuLink[],
    buttonClassName: string,
    parentMenu?: string
  ) => {
    return options.map((option, index) => {
      return (
        <button
          className={`${buttonClassName} ${
            props.dropdownItemClassName ? props.dropdownItemClassName : ""
          }`}
          key={`${option.title}-${index}`}
          onClick={() => {
            menuAction(option.href, option.onClick)
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              menuAction(option.href, option.onClick)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Tab" && isDesktop && index === options.length - 1 && parentMenu) {
              changeMenuShow(parentMenu, activeMenus, setActiveMenus)
            }
          }}
        >
          {option.iconSrc && isDesktop && (
            <img src={option.iconSrc} className={option.iconClassName} />
          )}
          {option.title}
        </button>
      )
    })
  }

  // Render the desktop dropdown that opens on mouse hover
  const getDesktopDropdown = (menuTitle: string, subMenus: MenuLink[]) => {
    return (
      <span key={menuTitle}>
        {menuTitle}
        <Icon size="small" symbol="arrowDown" fill={"#555555"} className={"pl-2"} />
        {activeMenus.indexOf(menuTitle) >= 0 && (
          <span className={"navbar-dropdown-container"}>
            <div className={"navbar-dropdown"}>
              {getDropdownOptions(subMenus, "navbar-dropdown-item", menuTitle)}
            </div>
          </span>
        )}
      </span>
    )
  }

  // Build styled mobile menu options
  const buildMobileMenuOptions = (
    menuLinks: MenuLink[],
    dropdownSublinkOptionClassName: string,
    dropdownOptionClassName: string,
    dropdownContainerClassName?: string
  ) => {
    return (
      <>
        {menuLinks.map((menuLink, index) => {
          if (menuLink.subMenuLinks && !props.flattenSubMenus) {
            return (
              <div key={`${menuLink.title}-${index}`}>
                <button
                  className={dropdownOptionClassName}
                  onClick={() =>
                    changeMenuShow(menuLink.title, activeMobileMenus, setActiveMobileMenus)
                  }
                >
                  {menuLink.title}
                  <Icon size="small" symbol="arrowDown" fill={"#555555"} className={"pl-2"} />
                </button>
                {activeMobileMenus.indexOf(menuLink.title) >= 0 && (
                  <div className={dropdownContainerClassName}>
                    {getDropdownOptions(
                      menuLink.subMenuLinks,
                      dropdownSublinkOptionClassName ?? ""
                    )}
                  </div>
                )}
              </div>
            )
          } else {
            return (
              <div key={`${menuLink.title}-${index}`}>
                {props.flattenSubMenus && menuLink.subMenuLinks
                  ? getDropdownOptions(menuLink.subMenuLinks, dropdownOptionClassName ?? "")
                  : getDropdownOptions([menuLink], dropdownOptionClassName ?? "")}
              </div>
            )
          }
        })}
      </>
    )
  }

  // Render the mobile drawer that opens on menu press when prop mobileDrawer is set
  const getMobileDrawer = () => {
    return (
      <CSSTransition in={mobileDrawer} timeout={400} classNames={"drawer-transition"} unmountOnExit>
        <span className={`navbar-mobile-drawer-dropdown-container`}>
          <div className={"navbar-mobile-drawer-dropdown"}>
            <button
              className={"navbar-mobile-drawer-close-row"}
              onClick={() => setMobileDrawer(false)}
            >
              <Icon size="small" symbol="arrowForward" fill={"#ffffff"} className={"pl-2"} />
            </button>
            {buildMobileMenuOptions(
              props.menuLinks,
              "navbar-mobile-drawer-dropdown-item navbar-mobile-drawer-dropdown-item-sublink",
              "navbar-mobile-drawer-dropdown-item"
            )}
          </div>
        </span>
      </CSSTransition>
    )
  }

  // Renders the default mobile dropdown that opens on menu press
  const getMobileDropdown = () => {
    return (
      <>
        {!props.mobileDrawer && (
          <span className={"navbar-mobile-dropdown-container"}>
            <div className={"navbar-mobile-dropdown"}>
              {buildMobileMenuOptions(
                props.menuLinks,
                "navbar-mobile-dropdown-item navbar-mobile-dropdown-item-sublink",
                "navbar-mobile-dropdown-item",
                "navbar-mobile-dropdown-links"
              )}
            </div>
          </span>
        )}
      </>
    )
  }
  const changeMenuShow = (
    title: string,
    menus: string[],
    setMenus: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const indexOfTitle = menus.indexOf(title)
    setMenus(indexOfTitle >= 0 ? menus.filter((menu) => menu !== title) : [...menus, title])
  }

  const getDesktopHeader = () => {
    return (
      <>
        {props.menuLinks.map((menuLink, index) => {
          let menuContent: JSX.Element
          if (menuLink.subMenuLinks) {
            menuContent = getDesktopDropdown(menuLink.title, menuLink.subMenuLinks)
          } else {
            menuContent = <div key={menuLink.title}>{menuLink.title}</div>
          }

          return !menuLink.subMenuLinks ? (
            <span
              onScroll={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className={`navbar-link ${props.menuItemClassName && props.menuItemClassName}`}
              tabIndex={0}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  menuAction(menuLink.href, menuLink.onClick)
                }
              }}
              onClick={() => {
                menuAction(menuLink.href, menuLink.onClick)
              }}
              key={`${menuLink.title}-${index}`}
            >
              {menuContent}
            </span>
          ) : (
            <span
              className={`navbar-link navbar-dropdown-title`}
              tabIndex={0}
              key={`${menuLink.title}-${index}`}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  changeMenuShow(menuLink.title, activeMenus, setActiveMenus)
                }
              }}
              onMouseEnter={() => changeMenuShow(menuLink.title, activeMenus, setActiveMenus)}
              onMouseLeave={() => changeMenuShow(menuLink.title, activeMenus, setActiveMenus)}
            >
              {menuContent}
            </span>
          )
        })}
      </>
    )
  }

  const getMobileHeader = () => {
    return (
      <>
        {props.mobileText ? (
          <div
            className={"flex flex-row items-center justify-center"}
            onClick={() => {
              if (!props.mobileDrawer) {
                setMobileMenu(!mobileMenu)
              } else {
                setMobileDrawer(!mobileDrawer)
              }
              setActiveMobileMenus([])
            }}
          >
            <button className={"pr-2 text-tiny text-primary uppercase"}>Menu</button>
            <Icon
              symbol={mobileMenu ? "closeSmall" : "hamburger"}
              size={"base"}
              className={"pr-3"}
            />
          </div>
        ) : (
          <Button
            size={AppearanceSizeType.small}
            onClick={() => {
              if (!props.mobileDrawer) {
                setMobileMenu(!mobileMenu)
              } else {
                setMobileDrawer(!mobileDrawer)
              }
              setActiveMobileMenus([])
            }}
            icon={mobileMenu ? "closeSmall" : "hamburger"}
            iconSize="base"
            className={"navbar-mobile-menu-button"}
            unstyled
          >
            {mobileMenu ? t("t.close") : t("t.menu")}
          </Button>
        )}
      </>
    )
  }

  const getLogo = () => {
    return (
      <div className={`navbar-logo`}>
        <button
          className={`logo ${props.logoClass && props.logoClass} ${getLogoWidthClass()} ${
            props.logoWidth && "navbar-custom-width"
          }`}
          aria-label="homepage"
          onClick={() => {
            menuAction(props.homeURL, props.homeOnClick)
          }}
        >
          <div className={`${props.imageOnly && "navbar-image-only-container"}`}>
            <img
              className={`logo__image ${props.imageOnly && "navbar-image-only"}`}
              src={props.logoSrc}
              alt={"Site logo"}
            />
            {props.title && <div className="logo__title">{props.title}</div>}
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className={"site-header"}>
      {props.languages && <LanguageNav languages={props.languages} />}

      <div className={`navbar-notice ${!props.noticeMobile && `navbar-notice-hide`}`}>
        <div className="navbar-notice__text">{props.notice ?? ""}</div>
      </div>

      <nav className="navbar-container" role="navigation" aria-label="main navigation">
        <div className="navbar">
          {getLogo()}
          <div className="navbar-menu">{isDesktop ? getDesktopHeader() : getMobileHeader()}</div>
        </div>
      </nav>
      {!isDesktop && mobileMenu && getMobileDropdown()}
      {getMobileDrawer()}
    </div>
  )
}

export { SiteHeader as default, SiteHeader }
