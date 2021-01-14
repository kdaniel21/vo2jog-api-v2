interface IAppError {
  status: number
  title: string
  message: string
  isOperational: boolean
}

export class AppError extends Error implements IAppError {
  public title: string

  constructor(
    public message: string,
    public status: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)

    this.status = status === 500 && isOperational ? 400 : status
    this.title = status < 500 ? 'fail' : 'error'
  }
}
