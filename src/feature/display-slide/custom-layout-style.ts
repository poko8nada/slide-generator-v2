export const layoutStyleString = `
/* Custom layout style for the slide */
.common{
  display: flex;
  align-items: center;
  width: 100%;
  font-weight : normal;
  gap: 0.25em;
}
.common span{
  font-size: .65em;
  line-height: 1em;
}
.common.top {
  position: absolute;
  top: 0;
  }
.common.bottom {
  position: absolute;
  bottom: 0;
  }
.common.center {
  justify-content: center;
  }
.common.left {
  justify-content: flex-start;
  padding-left: 0.5em;
  }
.common.right {
  justify-content: flex-end;
  padding-right: 0.5em;
  }
 }
`
