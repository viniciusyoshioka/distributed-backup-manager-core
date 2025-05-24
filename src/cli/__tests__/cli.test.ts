// import { Path } from '../../modules/file-system'
// import { IP, NetworkAddress } from '../../modules/network'
// import { Cli } from '../cli'
// import { CliExitExecutionError, CliInvalidArgumentError } from '../errors'


// // Mock dependencies
// jest.mock('node:process', () => ({
//   cwd: jest.fn(() => '/mocked/cwd'),
//   exit: jest.fn(),
//   env: {
//     PORT: '3000',
//   },
// }))


// jest.mock('../../env/assert-dotenv-is-valid', () => ({
//   assertDotEnvIsValid: jest.fn(),
// }))

// jest.mock('../../modules/file-system', () => ({
//   Path: {
//     isAbsolute: jest.fn(),
//     join: jest.fn((paths: string | string[]) => {
//       if (Array.isArray(paths)) {
//         return paths.join('/')
//       }
//       return paths
//     }),
//   },
// }))

// jest.mock('../../modules/network', () => ({
//   IP: {
//     isValid: jest.fn(),
//   },
//   NetworkAddress: {
//     isPortValid: jest.fn(),
//   },
// }))


// // Helper to capture console output
// const mockConsoleLog = jest.fn()
// const originalConsoleLog = console.log


// describe('Cli', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//     console.log = mockConsoleLog
//   })

//   afterAll(() => {
//     console.log = originalConsoleLog
//   })


//   describe('--help argument', () => {
//     it('should show help message and throw ExitExecutionError when --help is provided', () => {
//       expect(() => new Cli(['--help'])).toThrow(CliExitExecutionError)
//       expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage:'))
//     })

//     it('should show help message and throw ExitExecutionError when -h is provided', () => {
//       expect(() => new Cli(['-h'])).toThrow(CliExitExecutionError)
//       expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage:'))
//     })

//     // TODO: Test case when other arguments are provided with --help or -h
//   })


//   describe('--version argument', () => {
//     it('should show version and throw ExitExecutionError when --version is provided', () => {
//       expect(() => new Cli(['--version'])).toThrow(CliExitExecutionError)
//       expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('version:'))
//     })

//     it('should show version and throw ExitExecutionError when -v is provided', () => {
//       expect(() => new Cli(['-v'])).toThrow(CliExitExecutionError)
//       expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('version:'))
//     })

//     // TODO: Test case when other arguments are provided with --version or -v
//   })


//   describe('--source argument', () => {
//     it('should throw CliInvalidArgumentError when --source is not provided', () => {
//       expect(() => new Cli(['--destination', '/some/path'])).toThrow(CliInvalidArgumentError)
//       expect(() => new Cli(['--destination', '/some/path'])).toThrow('Argument "--source" is required')
//     })

//     it('should convert relative source path to absolute path', () => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockReturnValueOnce(false)

//       const cli = new Cli(['--source', 'relative/path', '--destination', '/some/path'])

//       expect(console.log).toHaveBeenCalledWith(expect.stringContaining('is not an absolute path'))
//       expect(cli.getArgs()['--source']).toBe('/mocked/cwd/relative/path')
//     })

//     it('should keep absolute source path unchanged', () => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockReturnValueOnce(true)

//       const cli = new Cli(['--source', '/absolute/path', '--destination', '/some/path'])

//       expect(cli.getArgs()['--source']).toBe('/absolute/path')
//     })

//     // TODO: Test -s
//   })


//   describe('--destination argument', () => {
//     it('should throw CliInvalidArgumentError when --destination is not provided', () => {
//       expect(() => new Cli(['--source', '/some/path'])).toThrow(CliInvalidArgumentError)
//       expect(() => new Cli(['--source', '/some/path'])).toThrow('Argument "--destination" is required')
//     })

//     it('should convert relative destination path to absolute path', () => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockImplementation((p: string) => p.startsWith('/'))

//       const cli = new Cli(['--source', '/some/path', '--destination', 'relative/path'])

//       expect(console.log).toHaveBeenCalledWith(expect.stringContaining('is not an absolute path'))
//       expect(cli.getArgs()['--destination']).toBe('/mocked/cwd/relative/path')
//     })

//     it('should keep absolute destination path unchanged', () => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockImplementation((p: string) => p.startsWith('/'))

//       const cli = new Cli(['--source', '/some/path', '--destination', '/absolute/path'])

//       expect(cli.getArgs()['--destination']).toBe('/absolute/path')
//     })

//     // TODO: Test -d
//   })


//   describe('--exception argument', () => {
//     beforeEach(() => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockImplementation((p: string) => p.startsWith('/'))
//     })


//     it('should handle no exceptions provided', () => {
//       const cli = new Cli(['--source', '/source/path', '--destination', '/dest/path'])
//       expect(cli.getArgs()['--exception']).toEqual([])
//     })

//     it('should convert relative exception paths to absolute paths', () => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockReturnValueOnce(false)

//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--exception',
//         'relative/exception',
//       ])

//       expect(cli.getArgs()['--exception']).toEqual(['/mocked/cwd/relative/exception'])
//       expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('is not an absolute path'))
//     })

//     it('should handle multiple exception paths', () => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockReturnValueOnce(true).mockReturnValueOnce(false)

//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--exception',
//         '/absolute/exception',
//         '--exception',
//         'relative/exception',
//       ])

//       expect(cli.getArgs()['--exception']).toEqual([
//         '/absolute/exception',
//         '/mocked/cwd/relative/exception',
//       ])
//     })

//     // TODO: Test if absolute path is kept as is
//     // TODO: Test -e
//   })


//   describe('--destination-address argument', () => {
//     beforeEach(() => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockImplementation((p: string) => p.startsWith('/'))
//     })


//     it('should set destination address to null if not provided', () => {
//       const cli = new Cli(['--source', '/source/path', '--destination', '/dest/path'])
//       expect(cli.getArgs()['--destination-address']).toBeNull()
//     })

//     it('should throw CliInvalidArgumentError for invalid IP address format', () => {
//       const isValidMock = IP.isValid as jest.Mock
//       isValidMock.mockReturnValueOnce(false)

//       expect(() => new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         'invalid-ip',
//       ])).toThrow(CliInvalidArgumentError)

//       expect(() => new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         'invalid-ip',
//       ])).toThrow('is not a valid IP address')
//     })

//     it('should accept valid IP address', () => {
//       const isValidMock = IP.isValid as jest.Mock
//       isValidMock.mockReturnValueOnce(true)

//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         '192.168.1.1',
//       ])

//       expect(cli.getArgs()['--destination-address']).toBe('192.168.1.1')
//     })

//     // TODO: Test IPv6 address
//     // TODO: Test -a
//   })


//   describe('--destination-port argument', () => {
//     beforeEach(() => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockImplementation((p: string) => p.startsWith('/'))

//       const isValidMock = IP.isValid as jest.Mock
//       isValidMock.mockReturnValue(true)
//     })


//     it('should use default port if not provided with destination address', () => {
//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         '192.168.1.1',
//       ])

//       // Default from process.env.PORT
//       expect(cli.getArgs()['--destination-port']).toBe('3000')
//     })

//     it('should throw CliInvalidArgumentError for invalid port', () => {
//       const isPortValidMock = NetworkAddress.isPortValid as jest.Mock
//       isPortValidMock.mockReturnValueOnce(false)

//       expect(() => new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         '192.168.1.1',
//         '--destination-port',
//         'invalid-port',
//       ])).toThrow(CliInvalidArgumentError)

//       expect(() => new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         '192.168.1.1',
//         '--destination-port',
//         'invalid-port',
//       ])).toThrow('is not a valid port')
//     })

//     it('should log warning and set port to null if destination address is not provided', () => {
//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-port',
//         '8080',
//       ])

//       expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('was given without "--destination-address"'))
//       expect(cli.getArgs()['--destination-port']).toBeNull()
//     })

//     it('should accept valid port with destination address', () => {
//       const isPortValidMock = NetworkAddress.isPortValid as jest.Mock
//       isPortValidMock.mockReturnValueOnce(true)

//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         '192.168.1.1',
//         '--destination-port',
//         '8080',
//       ])

//       expect(cli.getArgs()['--destination-port']).toBe('8080')
//     })

//     // TODO: Fix and enable test case
//     /* it('should throw error if no PORT env is available for default port', () => {
//       const originalEnv = process.env.PORT
//       process.env.PORT = undefined as unknown as string

//       expect(() => new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         '192.168.1.1',
//       ])).toThrow(CliInvalidArgumentError)

//       expect(() => new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--destination-address',
//         '192.168.1.1',
//       ])).toThrow('No "PORT" variable was found in .env file')

//       process.env.PORT = originalEnv
//     }) */

//     // TODO: Test -p
//     // TODO: Test number string converted to NaN, infinity, etc.
//     // TODO: Test number string converted to negative number
//     // TODO: Test other cases contained in the validation function
//   })


//   describe('--skip-confirmation argument', () => {
//     beforeEach(() => {
//       const isAbsoluteMock = Path.isAbsolute as jest.Mock
//       isAbsoluteMock.mockImplementation((p: string) => p.startsWith('/'))
//     })


//     it('should default to false if not provided', () => {
//       const cli = new Cli(['--source', '/source/path', '--destination', '/dest/path'])
//       expect(cli.getArgs()['--skip-confirmation']).toBe(false)
//     })

//     it('should set to true if provided', () => {
//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '--skip-confirmation',
//       ])

//       expect(cli.getArgs()['--skip-confirmation']).toBe(true)
//     })

//     it('should handle short flag -c', () => {
//       const cli = new Cli([
//         '--source',
//         '/source/path',
//         '--destination',
//         '/dest/path',
//         '-c',
//       ])

//       expect(cli.getArgs()['--skip-confirmation']).toBe(true)
//     })
//   })
// })
