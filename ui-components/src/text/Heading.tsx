import * as React from "react"

export interface HeadingProps {
  children?: React.ReactNode
  className?: string
  priority?: number
  style?: HeaderType
}

export type HeaderType = keyof typeof HeaderStyleMap

const HeaderStyleMap = {
  largeHeader: "text__large-header",
  mediumHeader: "text__medium-header",
  smallWeighted: "text__small-weighted",
  smallNormal: "text__small-normal",
  underlineHeader: "text__underline-header",
  lightWeighted: "text__light-weighted",
  capsWeighted: "text__caps-weighted",
}

const Heading = (props: HeadingProps) => {
  const priority = props.priority && props.priority >= 1 && props.priority <= 6 ? props.priority : 1
  const Tag = `h${priority}` as keyof JSX.IntrinsicElements
  const classNames = []
  if (props.style) classNames.push(HeaderStyleMap[props.style])
  if (props.className) classNames.push(props.className)

  return <Tag className={classNames.join(" ")}>{props.children}</Tag>
}

export { Heading as default, Heading }
