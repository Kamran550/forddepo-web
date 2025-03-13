import React from "react"
import classes from './book-cover.module.css'

export const BookCover = React.forwardRef((props, ref) => {
  return (
     <div className={classes.page} ref={ref} data-density="hard">
        <div className={classes.content}>
          <h2>{props.children}</h2>
        </div>
      </div>
  )
})

BookCover.displayName = "BookCover"
