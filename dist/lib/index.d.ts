/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as ActivityStream from "./activities";
import * as Auth from "./auth";
import * as Cmis from "./cmis";
import * as Config from "./config";
import * as Core from "./core";
import * as Discussions from "./discussions";
import * as Events from "./events";
import * as People from "./people";
import * as Spaces from "./spaces";
import * as Wall from "./wall";
export * from "./types";
declare const WebCenter: {
    ActivityStream: typeof ActivityStream;
    Auth: typeof Auth;
    Cmis: typeof Cmis;
    Config: typeof Config;
    Core: typeof Core;
    Discussions: typeof Discussions;
    Events: typeof Events;
    People: typeof People;
    Spaces: typeof Spaces;
    Wall: typeof Wall;
};
export default WebCenter;
