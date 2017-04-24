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

import CmisBase from "./base";
import * as Util from "./util";

export default class CmisObject extends CmisBase {
    public id: string;
    public author: string;
    public publishedDate: string;
    public contributor: string;
    public updatedDate: string;
    public editedDate: string;
    public summaryHTML: string;
    public cmisProps: {};

    constructor(objNode: Node) {
        super(objNode);
        this.processMetadata();
        this.cmisProps = Util.processCmisProps(objNode);
    }

    private processMetadata(): void {
        const idNode: Node = Util.select("./atom:id", this.node, true);
        const authNameNode: Node = Util.select("./atom:author/atom:name", this.node, true);
        const publishedNode: Node = Util.select("./atom:published", this.node, true);
        const contributorNameNode: Node = Util.select("./atom:contributor/atom:name", this.node, true);
        const updateNode: Node = Util.select("./atom:updated", this.node, true);
        const editedNode: Node = Util.select("./app:edited", this.node, true);
        const summaryNode: Node = Util.select("./atom:summary", this.node, true);

        this.id = idNode ? idNode.textContent : null;
        this.author = authNameNode ? authNameNode.textContent : null;
        this.publishedDate = publishedNode ? publishedNode.textContent : null;
        this.contributor = contributorNameNode ? contributorNameNode.textContent : null;
        this.updatedDate = updateNode ? updateNode.textContent : null;
        this.editedDate = editedNode ? editedNode.textContent : null;
        this.summaryHTML = summaryNode ? summaryNode.textContent : null; 
    }

}
